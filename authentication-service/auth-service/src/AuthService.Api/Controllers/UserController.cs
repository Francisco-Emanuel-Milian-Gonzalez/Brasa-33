using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using IAuthService = AuthService.Application.Interfaces.IAuthService;
using AuthService.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AuthService.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UsersController(
    IUserManagementService userManagementService,
    IAuthService authService) : ControllerBase
{
    private string? GetCurrentUserId() =>
        User.Claims.FirstOrDefault(c =>
            c.Type == "sub" ||
            c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

    [HttpPut("profile")]
    [Authorize]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<object>> UpdateProfile([FromForm] UpdateProfileDto dto)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await authService.UpdateProfileAsync(userId, dto);
        return Ok(new { success = true, message = "Perfil actualizado", data = user });
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<ActionResult<object>> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await authService.ChangePasswordAsync(userId, dto);
        return Ok(result);
    }

    [HttpDelete("me")]
    [Authorize]
    public async Task<IActionResult> DeleteMe([FromBody] DeleteAccountDto dto)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        await authService.DeleteAccountAsync(userId, dto.Password);
        return Ok(new { success = true, message = "Cuenta eliminada correctamente" });
    }

    private async Task<bool> CurrentUserIsAdmin()
    {
        var userId = User.Claims.FirstOrDefault(c =>
            c.Type == "sub" ||
            c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        if (string.IsNullOrEmpty(userId)) return false;
        var roles = await userManagementService.GetUserRolesAsync(userId);
        return roles.Contains(RoleConstants.ADMIN_ROLE);
    }

    /// <summary>Retorna todos los usuarios del sistema (solo ADMIN).</summary>
    [HttpGet]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetAllUsers()
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await userManagementService.GetAllUsersAsync();
        return Ok(new { success = true, users = result });
    }

    /// <summary>Actualiza el rol de un usuario (solo ADMIN).</summary>
    [HttpPut("{userId}/role")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<UserResponseDto>> UpdateUserRole(
        string userId, [FromBody] UpdateUserRoleDto dto)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await userManagementService.UpdateUserRoleAsync(userId, dto.RoleName);
        return Ok(new { success = true, user = result });
    }

    /// <summary>Elimina un usuario (solo ADMIN).</summary>
    [HttpDelete("{userId}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        await userManagementService.DeleteUserAsync(userId);
        return Ok(new { success = true, message = "Usuario eliminado correctamente" });
    }

    /// <summary>Retorna los roles de un usuario.</summary>
    [HttpGet("{userId}/roles")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<string>>> GetUserRoles(string userId)
    {
        var roles = await userManagementService.GetUserRolesAsync(userId);
        return Ok(roles);
    }

    /// <summary>Retorna todos los usuarios de un rol (solo ADMIN).</summary>
    [HttpGet("by-role/{roleName}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetUsersByRole(string roleName)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var users = await userManagementService.GetUsersByRoleAsync(roleName);
        return Ok(users);
    }
}
