using AuthService.Application.DTOs;
using AuthService.Application.DTOs.Email;

namespace AuthService.Application.Interfaces;

public interface IAuthService
{
    Task<RegisterResponseDto>  RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto>      LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto>      RefreshTokenAsync(string refreshToken);
    Task<EmailResponseDto>     VerifyEmailAsync(VerifyEmailDto verifyEmailDto);
    Task<EmailResponseDto>     ResendVerificationEmailAsync(ResendVerificationDto resendDto);
    Task<EmailResponseDto>     ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
    Task<EmailResponseDto>     ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    Task<UserResponseDto?>     GetUserByIdAsync(string userId);
    Task<UserResponseDto>      UpdateProfileAsync(string userId, UpdateProfileDto dto);
    Task<EmailResponseDto>     ChangePasswordAsync(string userId, ChangePasswordDto dto);
    Task<bool>                 DeleteAccountAsync(string userId, string password);
}
