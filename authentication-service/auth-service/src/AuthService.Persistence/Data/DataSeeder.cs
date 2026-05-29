using AuthService.Application.Services;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Persistence.Data;

/// <summary>
/// Siembra los datos mínimos necesarios al arrancar por primera vez:
/// los tres roles del sistema y un usuario administrador por defecto.
/// Es idempotente: comprueba la existencia antes de insertar.
/// </summary>
public static class DataSeeder
{
    public static async Task SeendAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        await SeedRolesAsync(context, logger);
        await SeedDefaultAdminAsync(context, logger);
    }

    // ── Roles ────────────────────────────────────────────────────────────────
    private static async Task SeedRolesAsync(ApplicationDbContext context, ILogger? logger)
    {
        var existingRoleNames = await context.Roles
            .Select(r => r.Name)
            .ToListAsync();

        var rolesToSeed = new[]
        {
            RoleConstants.ADMIN_ROLE,
            RoleConstants.MANAGER_ROLE,
            RoleConstants.CLIENT_ROLE,
        }
        .Where(name => !existingRoleNames.Contains(name))
        .Select(name => new Role
        {
            Id   = UuidGenerator.GenerateRoleId(),
            Name = name,
        })
        .ToList();

        if (rolesToSeed.Count > 0)
        {
            await context.Roles.AddRangeAsync(rolesToSeed);
            await context.SaveChangesAsync();
            logger?.LogInformation("Roles sembrados: {Roles}", string.Join(", ", rolesToSeed.Select(r => r.Name)));
        }
    }

    // ── Admin por defecto ────────────────────────────────────────────────────
    private static async Task SeedDefaultAdminAsync(ApplicationDbContext context, ILogger? logger)
    {
        // Sólo crear el admin si no existe ningún usuario con ADMIN_ROLE
        var hasAdmin = await context.Users
            .AnyAsync(u => u.UserRoles.Any(ur => ur.Role.Name == RoleConstants.ADMIN_ROLE));

        if (hasAdmin) return;

        var adminRole = await context.Roles
            .FirstOrDefaultAsync(r => r.Name == RoleConstants.ADMIN_ROLE);

        if (adminRole == null)
        {
            logger?.LogWarning("No se encontró el rol ADMIN_ROLE. No se puede sembrar el usuario administrador.");
            return;
        }

        var passwordHasher = new PasswordHashService();
        var userId      = UuidGenerator.GenerateUserId();
        var profileId   = UuidGenerator.GenerateUserId();
        var emailId     = UuidGenerator.GenerateUserId();
        var userRoleId  = UuidGenerator.GenerateUserId();
        var pwdResetId  = UuidGenerator.GenerateUserId();

        var adminUser = new User
        {
            Id       = userId,
            Name     = "Admin",
            SurName  = "La33",
            UserName = "admin",
            Email    = "admin@labrasa33.com",
            Password = passwordHasher.HashPassword("Admin2026!"),
            Status   = true,

            UserProfile = new UserProfile
            {
                Id             = profileId,
                UserId         = userId,
                ProfilePicture = string.Empty,
                Phone          = "00000000",
            },

            UserEmail = new UserEmail
            {
                Id                           = emailId,
                UserId                       = userId,
                EmailVerified                = true,
                EmailVerificationToken       = null,
                EmailVerificationTokenExpiry = null,
            },

            UserPasswordReset = new UserPasswordReset
            {
                Id                    = pwdResetId,
                UserId                = userId,
                PasswordResetToken    = null,
                PasswordResetTokenExpiry = null,
            },

            UserRoles =
            [
                new Domain.Entities.UserRole
                {
                    Id     = userRoleId,
                    UserId = userId,
                    RoleId = adminRole.Id,
                }
            ],
        };

        await context.Users.AddAsync(adminUser);
        await context.SaveChangesAsync();
        logger?.LogInformation(
            "Usuario administrador por defecto creado: {Username} / {Email}",
            adminUser.UserName, adminUser.Email
        );
    }
}
