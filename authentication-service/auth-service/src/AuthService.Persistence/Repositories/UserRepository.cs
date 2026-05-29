using AuthService.Application.Services;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Persistence.Repositories;

public class UserRepository(ApplicationDbContext context) : IUserRepository
{
    // ── Includes reutilizables ────────────────────────────────────────────
    private IQueryable<User> WithAllIncludes() =>
        context.Users
            .Include(u => u.UserProfile)
            .Include(u => u.UserEmail)
            .Include(u => u.UserPasswordReset)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role);

    // ── CRUD ──────────────────────────────────────────────────────────────
    public async Task<User> GetByIdAsync(string id)
    {
        var user = await WithAllIncludes()
            .FirstOrDefaultAsync(u => u.Id == id);

        return user ?? throw new InvalidOperationException($"User with id '{id}' not found.");
    }

    public async Task<User?> GetByEmailAsync(string email) =>
        await WithAllIncludes()
            .FirstOrDefaultAsync(u => EF.Functions.ILike(u.Email, email));

    public async Task<User?> GetByUsernameAsync(string username) =>
        await WithAllIncludes()
            .FirstOrDefaultAsync(u => EF.Functions.ILike(u.UserName, username));

    public async Task<User?> GetByEmailVerificartionTokenAsync(string token) =>
        await WithAllIncludes()
            .FirstOrDefaultAsync(u =>
                u.UserEmail != null
                && u.UserEmail.EmailVerificationToken == token
                && u.UserEmail.EmailVerificationTokenExpiry > DateTime.UtcNow);

    public async Task<User?> GetByPasswordResetTokenAsync(string token) =>
        await WithAllIncludes()
            .FirstOrDefaultAsync(u =>
                u.UserPasswordReset != null
                && u.UserPasswordReset.PasswordResetToken == token
                && u.UserPasswordReset.PasswordResetTokenExpiry > DateTime.UtcNow);

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken) =>
        await WithAllIncludes()
            .FirstOrDefaultAsync(u =>
                u.RefreshToken == refreshToken
                && u.RefreshTokenExpiry > DateTime.UtcNow);

    public async Task<User> CreateUserAsync(User user)
    {
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return await GetByIdAsync(user.Id);
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        await context.SaveChangesAsync();
        return await GetByIdAsync(user.Id);
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var user = await GetByIdAsync(id);
        context.Users.Remove(user);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<IReadOnlyList<User>> GetAllAsync() =>
        await WithAllIncludes()
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

    // ── Existence checks ──────────────────────────────────────────────────
    public async Task<bool> ExistsByEmailAsync(string email) =>
        await context.Users.AnyAsync(u => EF.Functions.ILike(u.Email, email));

    public async Task<bool> ExistsByUsernameAsync(string username) =>
        await context.Users.AnyAsync(u => EF.Functions.ILike(u.UserName, username));

    // ── Role management ───────────────────────────────────────────────────
    public async Task UpdateUserRolesAsync(string userId, string roleId)
    {
        var existing = await context.UserRoles
            .Where(ur => ur.UserId == userId)
            .ToListAsync();

        context.UserRoles.RemoveRange(existing);

        context.UserRoles.Add(new UserRole
        {
            Id        = UuidGenerator.GenerateUserId(),
            UserId    = userId,
            RoleId    = roleId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        });

        await context.SaveChangesAsync();
    }
}
