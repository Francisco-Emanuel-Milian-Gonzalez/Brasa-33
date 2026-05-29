using AuthService.Application.DTOs;
using AuthService.Application.DTOs.Email;
using AuthService.Application.Exceptions;
using AuthService.Application.Extensions;
using AuthService.Application.Interfaces;
using AuthService.Application.Validators;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace AuthService.Application.Services;

public class AuthService(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IPasswordHashService passwordHashService,
    IJwtTokenService jwtTokenService,
    ICloudinaryService cloudinaryService,
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<AuthService> logger) : IAuthService
{
    // ── Refresh token settings ────────────────────────────────────────────
    private static readonly int RefreshTokenExpiryDays = 7;

    // ── Register ─────────────────────────────────────────────────────────
    public async Task<RegisterResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        if (await userRepository.ExistsByEmailAsync(registerDto.Email))
        {
            logger.LogRegistrationWithExistingEmail();
            throw new BusinessException(ErrorCodes.EMAIL_ALREADY_EXISTS, "Email already exists");
        }

        if (await userRepository.ExistsByUsernameAsync(registerDto.Username))
        {
            logger.LogRegistrationWithExistingUsername();
            throw new BusinessException(ErrorCodes.USERNAME_ALREADY_EXISTS, "Username already exists");
        }

        // Imagen de perfil (opcional)
        string profilePicturePath;
        if (registerDto.ProfilePicture != null && registerDto.ProfilePicture.Size > 0)
        {
            var (isValid, errorMessage) = FileValidator.ValidateImage(registerDto.ProfilePicture);
            if (!isValid)
            {
                logger.LogWarning("File validation failed: {Error}", errorMessage);
                throw new BusinessException(ErrorCodes.INVALID_FILE_FORMAT, errorMessage!);
            }

            try
            {
                var fileName = FileValidator.GenerateSecureFileName(registerDto.ProfilePicture.FileName);
                profilePicturePath = await cloudinaryService.UploadImageAsync(registerDto.ProfilePicture, fileName);
            }
            catch (Exception)
            {
                logger.LogImageUploadError();
                throw new BusinessException(ErrorCodes.IMAGE_UPLOAD_FAILED, "Failed to upload profile image");
            }
        }
        else
        {
            profilePicturePath = cloudinaryService.GetDefaultAvatarUrl();
        }

        // Rol por defecto: CLIENT_ROLE (registro público = cliente)
        var defaultRole = await roleRepository.GetByNameAsync(RoleConstants.DEFAULT_REGISTRATION_ROLE);
        if (defaultRole == null)
            throw new InvalidOperationException(
                $"El rol por defecto '{RoleConstants.DEFAULT_REGISTRATION_ROLE}' no está sembrado en la BD.");

        var emailVerificationToken = TokenGenerator.GenerateEmailVerificationToken();
        var userId      = UuidGenerator.GenerateUserId();
        var userProfileId = UuidGenerator.GenerateUserId();
        var userEmailId   = UuidGenerator.GenerateUserId();
        var userRoleId    = UuidGenerator.GenerateUserId();
        var pwdResetId    = UuidGenerator.GenerateUserId();

        var user = new User
        {
            Id       = userId,
            Name     = registerDto.Name,
            SurName  = registerDto.Surname,
            UserName = registerDto.Username,
            Email    = registerDto.Email.ToLowerInvariant(),
            Password = passwordHashService.HashPassword(registerDto.Password),
            Status   = false,

            UserProfile = new UserProfile
            {
                Id             = userProfileId,
                UserId         = userId,
                ProfilePicture = profilePicturePath,
                Phone          = registerDto.Phone,
            },

            UserEmail = new UserEmail
            {
                Id                           = userEmailId,
                UserId                       = userId,
                EmailVerified                = false,
                EmailVerificationToken       = emailVerificationToken,
                EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24),
            },

            UserRoles =
            [
                new Domain.Entities.UserRole
                {
                    Id     = userRoleId,
                    UserId = userId,
                    RoleId = defaultRole.Id,
                }
            ],

            UserPasswordReset = new UserPasswordReset
            {
                Id                   = pwdResetId,
                UserId               = userId,
                PasswordResetToken   = null,
                PasswordResetTokenExpiry = null,
            },
        };

        var created = await userRepository.CreateUserAsync(user);
        logger.LogUserRegistered(created.UserName);

        _ = Task.Run(async () =>
        {
            try
            {
                await emailService.SendEmailVerificationAsync(
                    created.Email, created.UserName, emailVerificationToken);
                logger.LogInformation("Verification email sent to {Email}", created.Email);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send verification email to {Email}", created.Email);
            }
        });

        return new RegisterResponseDto
        {
            Success                  = true,
            User                     = MapToUserResponseDto(created),
            Message                  = "Usuario registrado correctamente. Por favor verifica tu correo para activar la cuenta.",
            EmailVerificationRequired = true,
        };
    }

    // ── Login ─────────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        User? user = loginDto.EmailOrUsername.Contains('@')
            ? await userRepository.GetByEmailAsync(loginDto.EmailOrUsername.ToLowerInvariant())
            : await userRepository.GetByUsernameAsync(loginDto.EmailOrUsername);

        if (user == null)
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        if (!user.Status)
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("La cuenta no está activa. Verifica tu correo electrónico.");
        }

        if (!passwordHashService.VerifyPassword(loginDto.Password, user.Password))
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        logger.LogUserLoggedIn();

        // Generar tokens
        var accessToken  = jwtTokenService.GenerateToken(user);
        var refreshToken = GenerateRefreshToken();
        var expiryMinutes = int.Parse(configuration["JwtSettings:ExpiryInMinutes"] ?? "60");

        // Persistir refresh token
        user.RefreshToken       = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(RefreshTokenExpiryDays);
        await userRepository.UpdateUserAsync(user);

        return new AuthResponseDto
        {
            Success      = true,
            Message      = "Inicio de sesión exitoso",
            AccessToken  = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn    = expiryMinutes,
            UserDetails  = MapToUserDetailsDto(user),
        };
    }

    // ── Refresh token ─────────────────────────────────────────────────────
    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var user = await userRepository.GetByRefreshTokenAsync(refreshToken);

        if (user == null
            || user.RefreshToken != refreshToken
            || user.RefreshTokenExpiry == null
            || user.RefreshTokenExpiry < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Refresh token inválido o expirado");
        }

        // Rotar el refresh token (evita reutilización)
        var newAccessToken  = jwtTokenService.GenerateToken(user);
        var newRefreshToken = GenerateRefreshToken();
        var expiryMinutes   = int.Parse(configuration["JwtSettings:ExpiryInMinutes"] ?? "60");

        user.RefreshToken       = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(RefreshTokenExpiryDays);
        await userRepository.UpdateUserAsync(user);

        logger.LogInformation("Refresh token rotado para usuario {Username}", user.UserName);

        return new AuthResponseDto
        {
            Success      = true,
            Message      = "Token renovado exitosamente",
            AccessToken  = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresIn    = expiryMinutes,
            UserDetails  = MapToUserDetailsDto(user),
        };
    }

    // ── Verify email ──────────────────────────────────────────────────────
    public async Task<EmailResponseDto> VerifyEmailAsync(VerifyEmailDto verifyEmailDto)
    {
        var user = await userRepository.GetByEmailVerificartionTokenAsync(verifyEmailDto.Token);
        if (user?.UserEmail == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Token de verificación inválido o expirado",
            };
        }

        user.UserEmail.EmailVerified                = true;
        user.Status                                 = true;
        user.UserEmail.EmailVerificationToken       = null;
        user.UserEmail.EmailVerificationTokenExpiry = null;

        await userRepository.UpdateUserAsync(user);

        try { await emailService.SendWelcomeEmailAsync(user.Email, user.UserName); }
        catch (Exception ex) { logger.LogError(ex, "Failed to send welcome email to {Email}", user.Email); }

        logger.LogInformation("Email verified for {Username}", user.UserName);

        return new EmailResponseDto
        {
            Success = true,
            Message = "Correo verificado correctamente",
            Data    = new { email = user.Email, verified = true },
        };
    }

    // ── Resend verification ───────────────────────────────────────────────
    public async Task<EmailResponseDto> ResendVerificationEmailAsync(ResendVerificationDto resendDto)
    {
        var user = await userRepository.GetByEmailAsync(resendDto.Email);
        if (user?.UserEmail == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Usuario no encontrado",
                Data    = new { email = resendDto.Email, sent = false },
            };
        }

        if (user.UserEmail.EmailVerified)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "El correo ya fue verificado",
                Data    = new { email = user.Email, verified = true },
            };
        }

        var newToken = TokenGenerator.GenerateEmailVerificationToken();
        user.UserEmail.EmailVerificationToken       = newToken;
        user.UserEmail.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
        await userRepository.UpdateUserAsync(user);

        try
        {
            await emailService.SendEmailVerificationAsync(user.Email, user.UserName, newToken);
            return new EmailResponseDto
            {
                Success = true,
                Message = "Correo de verificación reenviado",
                Data    = new { email = user.Email, sent = true },
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to resend verification email to {Email}", user.Email);
            return new EmailResponseDto
            {
                Success = false,
                Message = "Error al enviar el correo de verificación",
                Data    = new { email = user.Email, sent = false },
            };
        }
    }

    // ── Forgot password ───────────────────────────────────────────────────
    public async Task<EmailResponseDto> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
    {
        var user = await userRepository.GetByEmailAsync(forgotPasswordDto.Email);

        // Responder siempre con éxito (evitar enumeración de emails)
        var genericResponse = new EmailResponseDto
        {
            Success = true,
            Message = "Si el correo existe, recibirás un enlace de recuperación.",
            Data    = new { email = forgotPasswordDto.Email, initiated = true },
        };

        if (user == null) return genericResponse;

        var resetToken = TokenGenerator.GeneratePasswordResetToken();

        if (user.UserPasswordReset == null)
        {
            user.UserPasswordReset = new UserPasswordReset
            {
                UserId               = user.Id,
                PasswordResetToken   = resetToken,
                PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1),
            };
        }
        else
        {
            user.UserPasswordReset.PasswordResetToken       = resetToken;
            user.UserPasswordReset.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        }

        await userRepository.UpdateUserAsync(user);

        try { await emailService.SendPasswordResetAsync(user.Email, user.UserName, resetToken); }
        catch (Exception ex) { logger.LogError(ex, "Failed to send password reset email to {Email}", user.Email); }

        return genericResponse;
    }

    // ── Reset password ────────────────────────────────────────────────────
    public async Task<EmailResponseDto> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        var user = await userRepository.GetByPasswordResetTokenAsync(resetPasswordDto.Token);
        if (user?.UserPasswordReset == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Token de recuperación inválido o expirado",
                Data    = new { token = resetPasswordDto.Token, reset = false },
            };
        }

        user.Password                                  = passwordHashService.HashPassword(resetPasswordDto.NewPassword);
        user.UserPasswordReset.PasswordResetToken      = null;
        user.UserPasswordReset.PasswordResetTokenExpiry = null;
        // Invalidar refresh tokens activos al cambiar contraseña
        user.RefreshToken       = null;
        user.RefreshTokenExpiry = null;

        await userRepository.UpdateUserAsync(user);
        logger.LogInformation("Password reset for {Username}", user.UserName);

        return new EmailResponseDto
        {
            Success = true,
            Message = "Contraseña actualizada correctamente",
            Data    = new { email = user.Email, reset = true },
        };
    }

    // ── Get profile ───────────────────────────────────────────────────────
    public async Task<UserResponseDto?> GetUserByIdAsync(string userId)
    {
        var user = await userRepository.GetByIdAsync(userId);
        return user == null ? null : MapToUserResponseDto(user);
    }

    public async Task<UserResponseDto> UpdateProfileAsync(string userId, UpdateProfileDto dto)
    {
        var user = await userRepository.GetByIdAsync(userId);

        if (!string.IsNullOrWhiteSpace(dto.Name))
            user.Name = dto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Surname))
            user.SurName = dto.Surname.Trim();
        if (dto.Phone != null)
            user.UserProfile.Phone = dto.Phone.Trim();

        if (dto.ProfilePicture != null && dto.ProfilePicture.Size > 0)
        {
            var (isValid, errorMessage) = FileValidator.ValidateImage(dto.ProfilePicture);
            if (!isValid)
                throw new BusinessException(ErrorCodes.INVALID_FILE_FORMAT, errorMessage!);

            var fileName = FileValidator.GenerateSecureFileName(dto.ProfilePicture.FileName);
            user.UserProfile.ProfilePicture = await cloudinaryService.UploadImageAsync(dto.ProfilePicture, fileName);
        }

        user.UpdatedAt = DateTime.UtcNow;
        await userRepository.UpdateUserAsync(user);
        return MapToUserResponseDto(user);
    }

    public async Task<EmailResponseDto> ChangePasswordAsync(string userId, ChangePasswordDto dto)
    {
        var user = await userRepository.GetByIdAsync(userId);

        if (!passwordHashService.VerifyPassword(dto.CurrentPassword, user.Password))
            throw new BusinessException(ErrorCodes.INVALID_CREDENTIALS, "Contraseña actual incorrecta");

        user.Password = passwordHashService.HashPassword(dto.NewPassword);
        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;
        await userRepository.UpdateUserAsync(user);

        return new EmailResponseDto
        {
            Success = true,
            Message = "Contraseña actualizada correctamente",
        };
    }

    public async Task<bool> DeleteAccountAsync(string userId, string password)
    {
        var user = await userRepository.GetByIdAsync(userId);

        if (!passwordHashService.VerifyPassword(password, user.Password))
            throw new BusinessException(ErrorCodes.INVALID_CREDENTIALS, "Contraseña incorrecta");

        return await userRepository.DeleteUserAsync(userId);
    }

    // ── Private helpers ───────────────────────────────────────────────────
    private static string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }

    private UserResponseDto MapToUserResponseDto(User user)
    {
        var userRole = user.UserRoles.FirstOrDefault()?.Role?.Name
                       ?? RoleConstants.CLIENT_ROLE;

        return new UserResponseDto
        {
            Id              = user.Id,
            Name            = user.Name,
            Surname         = user.SurName,
            Username        = user.UserName,
            Email           = user.Email,
            ProfilePicture  = cloudinaryService.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone           = user.UserProfile?.Phone ?? string.Empty,
            Role            = userRole,
            Status          = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt       = user.CreatedAt,
            UpdatedAt       = user.UpdatedAt,
        };
    }

    private UserDetailsDto MapToUserDetailsDto(User user)
    {
        return new UserDetailsDto
        {
            Id             = user.Id,
            FullName       = $"{user.Name} {user.SurName}".Trim(),
            Username       = user.UserName,
            Email          = user.Email,
            ProfilePicture = cloudinaryService.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Role           = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.CLIENT_ROLE,
        };
    }
}
