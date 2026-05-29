namespace AuthService.Domain.Constants;

/// <summary>
/// Constantes de roles del sistema.
/// Estos valores son los que se emiten en el claim "role" del JWT
/// y deben coincidir con los nombres de rol almacenados en la BD.
/// </summary>
public static class RoleConstants
{
    public const string ADMIN_ROLE   = "ADMIN_ROLE";
    public const string MANAGER_ROLE = "MANAGER_ROLE";
    public const string CLIENT_ROLE  = "CLIENT_ROLE";

    /// <summary>
    /// Rol por defecto asignado al registrarse públicamente.
    /// </summary>
    public const string DEFAULT_REGISTRATION_ROLE = CLIENT_ROLE;

    /// <summary>
    /// Todos los roles válidos del sistema.
    /// </summary>
    public static readonly string[] AllowedRoles =
    [
        ADMIN_ROLE,
        MANAGER_ROLE,
        CLIENT_ROLE,
    ];

    /// <summary>
    /// Roles con acceso administrativo (admin + gerente).
    /// </summary>
    public static readonly string[] ManagementRoles =
    [
        ADMIN_ROLE,
        MANAGER_ROLE,
    ];
}
