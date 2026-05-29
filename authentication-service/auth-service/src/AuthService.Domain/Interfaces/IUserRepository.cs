using AuthService.Domain.Entities;

namespace AuthService.Domain.Interfaces;

public interface IUserRepository
{
    Task<User>  CreateUserAsync(User user);
    Task<User>  GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailVerificartionTokenAsync(string token);
    Task<User?> GetByPasswordResetTokenAsync(string token);

    /// <summary>Busca un usuario por su refresh token activo (no expirado).</summary>
    Task<User?> GetByRefreshTokenAsync(string refreshToken);

    Task<IReadOnlyList<User>> GetAllAsync();

    Task<bool>  ExistsByEmailAsync(string email);
    Task<bool>  ExistsByUsernameAsync(string username);
    Task<User>  UpdateUserAsync(User user);
    Task<bool>  DeleteUserAsync(string id);
    Task        UpdateUserRolesAsync(string userId, string roleId);
}
