using System.ComponentModel.DataAnnotations;
using AuthService.Application.Interfaces;

namespace AuthService.Application.DTOs;

/// <summary>
/// Datos requeridos para registrar un nuevo usuario (rol CLIENT por defecto).
/// Se envía como multipart/form-data para soportar imagen de perfil opcional.
/// </summary>
public class RegisterDto
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MaxLength(25, ErrorMessage = "El nombre no puede superar 25 caracteres")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio")]
    [MaxLength(25, ErrorMessage = "El apellido no puede superar 25 caracteres")]
    public string Surname { get; set; } = string.Empty;

    [Required(ErrorMessage = "El username es obligatorio")]
    [MaxLength(25, ErrorMessage = "El username no puede superar 25 caracteres")]
    [RegularExpression(
        @"^[a-zA-Z0-9_\.]+$",
        ErrorMessage = "El username solo puede contener letras, números, guión bajo o punto")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress(ErrorMessage = "El formato del email no es válido")]
    [MaxLength(150, ErrorMessage = "El email no puede superar 150 caracteres")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Contraseña segura: mínimo 8 caracteres, al menos una mayúscula,
    /// una minúscula, un dígito y un carácter especial.
    /// </summary>
    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [MaxLength(72, ErrorMessage = "La contraseña no puede superar 72 caracteres")]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#\.])[A-Za-z\d@$!%*?&_\-#\.]{8,}$",
        ErrorMessage = "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&_-#.)")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es obligatorio")]
    [StringLength(8, MinimumLength = 8, ErrorMessage = "El teléfono debe tener exactamente 8 dígitos")]
    [RegularExpression(@"^\d{8}$", ErrorMessage = "El teléfono debe contener solo dígitos")]
    public string Phone { get; set; } = string.Empty;

    /// <summary>Imagen de perfil opcional (jpg, jpeg, png, webp — máx 5MB).</summary>
    public IFileData? ProfilePicture { get; set; }
}
