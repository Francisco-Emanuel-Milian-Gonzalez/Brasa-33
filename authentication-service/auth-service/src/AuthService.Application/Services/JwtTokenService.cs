using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuthService.Application.Services;

public class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    public string GenerateToken(User user)
    {
        var jwtSettings     = configuration.GetSection("JwtSettings");
        var secretKey       = jwtSettings["SecretKey"]       ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer          = jwtSettings["Issuer"]          ?? "Brasa33";
        var audience        = jwtSettings["Audience"]        ?? "Brasa33";
        var expiryInMinutes = int.Parse(jwtSettings["ExpiryInMinutes"] ?? "60");

        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Rol del usuario — fallback a CLIENT_ROLE si aún no tiene ninguno asignado
        var role = user.UserRoles?.FirstOrDefault()?.Role?.Name
                   ?? RoleConstants.CLIENT_ROLE;

        var claims = new List<Claim>
        {
            // Estándar JWT
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64),

            // Identidad del usuario
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("username", user.UserName),

            // Rol — emitido en dos formas para compatibilidad:
            //   "role" → lo lee el middleware de Node.js (req.user.role)
            //   ClaimTypes.Role → lo lee [Authorize(Roles=...)] de .NET
            new("role",            role),
            new(ClaimTypes.Role,   role),
        };

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddMinutes(expiryInMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
