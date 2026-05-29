using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

public class RefreshTokenDto
{
    [Required(ErrorMessage = "El refresh token es obligatorio")]
    public string RefreshToken { get; set; } = string.Empty;
}
