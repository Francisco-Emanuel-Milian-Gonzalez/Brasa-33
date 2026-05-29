namespace AuthService.Application.DTOs;

/// <summary>
/// Datos compactos del usuario incluidos en la respuesta de login.
/// El cliente los almacena en el store de Zustand para mostrar
/// información en la UI sin necesidad de llamadas adicionales.
/// </summary>
public class UserDetailsDto
{
    public string Id { get; set; } = string.Empty;

    /// <summary>Nombre completo (Name + SurName).</summary>
    public string FullName { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ProfilePicture { get; set; } = string.Empty;

    /// <summary>
    /// Nombre exacto del rol: ADMIN_ROLE | MANAGER_ROLE | CLIENT_ROLE.
    /// Coincide con el claim "role" del JWT.
    /// </summary>
    public string Role { get; set; } = string.Empty;
}
