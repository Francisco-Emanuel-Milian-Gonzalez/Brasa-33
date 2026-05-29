namespace AuthService.Application.DTOs;

/// <summary>
/// Respuesta del endpoint POST /auth/login.
/// Los nombres de propiedad coinciden con lo que espera el cliente React
/// (camelCase vía JsonSerializerOptions.PropertyNamingPolicy).
/// </summary>
public class AuthResponseDto
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;

    /// <summary>JWT de corta duración (acceso a recursos protegidos).</summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>Token opaco de larga duración para renovar el JWT de acceso.</summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>Duración en minutos del access token.</summary>
    public int ExpiresIn { get; set; }

    public UserDetailsDto UserDetails { get; set; } = new();
}
