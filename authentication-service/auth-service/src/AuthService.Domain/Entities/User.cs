using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class User
{
    [Key]
    [MaxLength(16)]
    public string Id { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MaxLength(25, ErrorMessage = "El nombre no debe tener más de 25 caracteres")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio")]
    [MaxLength(25, ErrorMessage = "El apellido no debe tener más de 25 caracteres")]
    public string SurName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El username es obligatorio")]
    [MaxLength(25, ErrorMessage = "El username no debe tener más de 25 caracteres")]
    public string UserName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es obligatorio")]
    [MaxLength(150, ErrorMessage = "El email no debe tener más de 150 caracteres")]
    [EmailAddress(ErrorMessage = "El formato del email no es válido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [MaxLength(255, ErrorMessage = "La contraseña no debe tener más de 255 caracteres")]
    public string Password { get; set; } = string.Empty;

    public bool Status { get; set; } = false;

    /// <summary>
    /// Token opaco para renovar el JWT de acceso sin re-autenticar.
    /// Caduca en RefreshTokenExpiry.
    /// </summary>
    [MaxLength(500)]
    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiry { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public UserProfile UserProfile { get; set; } = null!;
    public ICollection<UserRole> UserRoles { get; set; } = [];
    public UserEmail UserEmail { get; set; } = null!;
    public UserPasswordReset UserPasswordReset { get; set; } = null!;
}
