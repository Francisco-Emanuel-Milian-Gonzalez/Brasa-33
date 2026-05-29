using AuthService.Application.DTOs;
using AuthService.Application.DTOs.Email;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AuthService.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    // ── Profile ────────────────────────────────────────────────────────────
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<object>> GetProfile()
    {
        var userId = User.Claims
            .FirstOrDefault(c => c.Type == "sub"
                || c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
            ?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await authService.GetUserByIdAsync(userId);
        if (user == null)
            return NotFound();

        return Ok(new { success = true, message = "Perfil obtenido", data = user });
    }

    [HttpPost("profile/by-id")]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<object>> GetProfileById([FromBody] GetProfileByIdDto request)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
            return BadRequest(new { success = false, message = "El userId es requerido" });

        var user = await authService.GetUserByIdAsync(request.UserId);
        if (user == null)
            return NotFound(new { success = false, message = "Usuario no encontrado" });

        return Ok(new { success = true, message = "Perfil obtenido", data = user });
    }

    // ── Register ────────────────────────────────────────────────────────────
    [HttpPost("register")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromForm] RegisterDto registerDto)
    {
        var result = await authService.RegisterAsync(registerDto);
        return StatusCode(201, result);
    }

    // ── Login ───────────────────────────────────────────────────────────────
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var result = await authService.LoginAsync(loginDto);
        return Ok(result);
    }

    // ── Refresh token ───────────────────────────────────────────────────────
    /// <summary>
    /// Renueva el JWT de acceso usando un refresh token válido.
    /// El refresh token anterior se invalida (rotación de tokens).
    /// </summary>
    [HttpPost("refresh")]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<AuthResponseDto>> Refresh([FromBody] RefreshTokenDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Refresh token requerido" });

        var result = await authService.RefreshTokenAsync(dto.RefreshToken);
        return Ok(result);
    }

    // ── Email verification ──────────────────────────────────────────────────
    [HttpPost("verify-email")]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<EmailResponseDto>> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
    {
        var result = await authService.VerifyEmailAsync(verifyEmailDto);
        return Ok(result);
    }

    [HttpPost("resend-verification")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<EmailResponseDto>> ResendVerification([FromBody] ResendVerificationDto resendDto)
    {
        var result = await authService.ResendVerificationEmailAsync(resendDto);

        if (!result.Success)
        {
            if (result.Message.Contains("no encontrado", StringComparison.OrdinalIgnoreCase))
                return NotFound(result);
            if (result.Message.Contains("verificado", StringComparison.OrdinalIgnoreCase))
                return BadRequest(result);
            return StatusCode(503, result);
        }

        return Ok(result);
    }

    // ── Password recovery ───────────────────────────────────────────────────
    [HttpPost("forgot-password")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<EmailResponseDto>> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        var result = await authService.ForgotPasswordAsync(forgotPasswordDto);
        if (!result.Success)
            return StatusCode(503, result);
        return Ok(result);
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<EmailResponseDto>> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        var result = await authService.ResetPasswordAsync(resetPasswordDto);
        return Ok(result);
    }
}
