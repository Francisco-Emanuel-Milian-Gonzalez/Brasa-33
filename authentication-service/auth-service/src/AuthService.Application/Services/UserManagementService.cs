using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;

namespace AuthService.Application.Services;

public class UserManagementService(IUserRepository users, IRoleRepository roles, ICloudinaryService cloudinary) : IUserManagementService
{
    public async Task<IReadOnlyList<UserResponseDto>> GetAllUsersAsync()
    {
        var allUsers = await users.GetAllAsync();
        return allUsers.Select(u => MapToDto(u)).ToList();
    }

    public async Task<bool> DeleteUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("Invalid userId", nameof(userId));

        var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);
        var user = await users.GetByIdAsync(userId);
        var isAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);

        if (isAdmin && adminCount <= 1)
            throw new InvalidOperationException("Cannot delete the last administrator");

        return await users.DeleteUserAsync(userId);
    }

    public async Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName)
    {
        // Normalize
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;

        // Validate inputs
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("Invalid userId", nameof(userId));
        if (!RoleConstants.AllowedRoles.Contains(roleName))
            throw new InvalidOperationException(
                $"Role not allowed. Valid roles: {string.Join(", ", RoleConstants.AllowedRoles)}");

        // Load user with roles
        var user = await users.GetByIdAsync(userId);

        // If demoting an admin, prevent removing last admin
        var isUserAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);
        if (isUserAdmin && roleName != RoleConstants.ADMIN_ROLE)
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);

            if (adminCount <= 1)
            {
                throw new InvalidOperationException("Cannot remove the last administrator");
            }
        }

        // Find role entity
        var role = await roles.GetByNameAsync(roleName)
                       ?? throw new InvalidOperationException($"Role {roleName} not found");

        // Update role using repository method
        await users.UpdateUserRolesAsync(userId, role.Id);

        // Reload user with updated roles
        user = await users.GetByIdAsync(userId);
        return MapToDto(user);
    }

    public async Task<IReadOnlyList<string>> GetUserRolesAsync(string userId)
    {
        var roleNames = await roles.GetUserRoleNameAsync(userId);
        return roleNames;
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;
        var usersInRole = await roles.GetUsersByRoleAsync(roleName);
        return usersInRole.Select(u => MapToDto(u)).ToList();
    }

    // ── Private mapper ────────────────────────────────────────────────────
    private UserResponseDto MapToDto(User u)
    {
        var roleName = u.UserRoles.FirstOrDefault()?.Role?.Name ?? string.Empty;
        return new UserResponseDto
        {
            Id               = u.Id,
            Name             = u.Name,
            Surname          = u.SurName,
            Username         = u.UserName,
            Email            = u.Email,
            ProfilePicture   = cloudinary.GetFullImageUrl(u.UserProfile?.ProfilePicture ?? string.Empty),
            Phone            = u.UserProfile?.Phone ?? string.Empty,
            Role             = roleName,
            Status           = u.Status,
            IsEmailVerified  = u.UserEmail?.EmailVerified ?? false,
            CreatedAt        = u.CreatedAt,
            UpdatedAt        = u.UpdatedAt
        };
    }
}
