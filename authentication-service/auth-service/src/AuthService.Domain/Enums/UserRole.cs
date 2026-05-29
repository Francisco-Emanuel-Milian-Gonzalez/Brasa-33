namespace AuthService.Domain.Enums;

/// <summary>
/// Enumeración de roles del sistema.
/// Usar RoleConstants para los valores en string exactos de JWT y base de datos.
/// </summary>
public enum UserRoleEnum
{
    CLIENT_ROLE,
    MANAGER_ROLE,
    ADMIN_ROLE,
}
