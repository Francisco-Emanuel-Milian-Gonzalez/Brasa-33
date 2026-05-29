using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using AuthService.Application.Interfaces;
using System.IO;

namespace AuthService.Application.Services;

public class EmailService(IConfiguration configuration, ILogger<EmailService> logger) : IEmailService
{
    public async Task SendEmailVerificationAsync(string email, string username, string token)
    {
        var subject = "Verifica tu dirección de correo electrónico";
        var verificationUrl = $"{configuration["AppSettings:FrontendUrl"]}/verify-email?token={token}";

       var body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px 30px; background-color: #16161a; border-radius: 12px; color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.3);'>

                <div style='text-align: center; padding-bottom: 30px;'>
                    <h2 style='color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: 0.5px;'>Verifica tu dirección de correo electrónico</h2>
                    <p style='color: #71717a; font-size: 14px; margin-top: 8px;'>Brasa 33</p>
                </div>

                <p style='font-size: 16px; color: #e4e4e7; line-height: 1.5; margin: 0 0 16px 0;'>
                    Gracias por registrarte, <strong>{username}</strong>.
                </p>

                <p style='font-size: 15px; color: #a1a1aa; line-height: 1.6; margin: 0 0 32px 0;'>
                    Para activar tu cuenta y acceder al panel de administración, es necesario que confirmes tu dirección de correo electrónico haciendo clic en el siguiente botón:
                </p>

                <div style='text-align: center; margin: 32px 0;'>
                    <a href='{verificationUrl}' 
                       style='background-color: #a1a1aa; color: #16161a; padding: 14px 32px; 
                              text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: bold; display: inline-block; transition: background-color 0.2s;'>
                        Verificar mi correo
                    </a>
                </div>

                <p style='font-size: 14px; font-weight: 600; color: #e4e4e7; margin: 32px 0 8px 0;'>
                    Token:
                </p>

                <div style='background-color: #242427; padding: 14px; border-radius: 8px; border: 1px solid #2e2e33; margin-bottom: 32px; text-align: center;'>
                    <p style='word-break: break-all; font-size: 16px; font-weight: bold; color: #ffffff; margin: 0; font-family: monospace; letter-spacing: 1px;'>
                        {token}
                    </p>
                </div>

                <p style='font-size: 14px; color: #71717a; margin: 0 0 8px 0;'>
                    Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                </p>

                <div style='background-color: #242427; padding: 14px; border-radius: 8px; border: 1px solid #2e2e33; margin-bottom: 32px;'>
                    <p style='word-break: break-all; font-size: 13px; color: #a1a1aa; margin: 0; font-family: monospace;'>
                        {verificationUrl}
                    </p>
                </div>

                <hr style='margin: 32px 0; border: none; border-top: 1px solid #2e2e33;' />

                <p style='font-size: 13px; color: #71717a; line-height: 1.5; margin: 0 0 12px 0;'>
                    Este enlace y token expirarán en 24 horas por razones de seguridad.
                </p>

                <p style='font-size: 13px; color: #71717a; line-height: 1.5; margin: 0 0 32px 0;'>
                    Si no creaste una cuenta en Brasa 33, puedes ignorar este mensaje sin inconvenientes.
                </p>

                <p style='font-size: 12px; color: #52525b; text-align: center; margin: 0;'>
                    © {DateTime.Now.Year} Brasa 33. Todos los derechos reservados.
                </p>

            </div>
            ";
        await SendEmailAsync(email, subject, body);
    }

    public async Task SendPasswordResetAsync(string email, string username, string token)
    {
        var subject = "Restablece tu contraseña";
        var resetUrl = $"{configuration["AppSettings:FrontendUrl"]}/reset-password?token={token}";
        var body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px 30px; background-color: #16161a; border-radius: 12px; color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.3);'>

                <div style='text-align: center; padding-bottom: 30px;'>
                    <h2 style='color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: 0.5px;'>Restablecimiento de Contraseña</h2>
                    <p style='color: #71717a; font-size: 14px; margin-top: 8px;'>Brasa 33</p>
                </div>

                <p style='font-size: 16px; color: #e4e4e7; line-height: 1.5; margin: 0 0 16px 0;'>
                    Hola <strong>{username}</strong>,
                </p>

                <p style='font-size: 15px; color: #a1a1aa; line-height: 1.6; margin: 0 0 32px 0;'>
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú, puedes establecer una nueva credencial haciendo clic en el siguiente botón:
                </p>

                <div style='text-align: center; margin: 32px 0;'>
                    <a href='{resetUrl}' 
                       style='background-color: #a1a1aa; color: #16161a; padding: 14px 32px; 
                              text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: bold; display: inline-block; transition: background-color 0.2s;'>
                        Restablecer mi contraseña
                    </a>
                </div>

                <p style='font-size: 14px; font-weight: 600; color: #e4e4e7; margin: 32px 0 8px 0;'>
                    Token:
                </p>

                <div style='background-color: #242427; padding: 14px; border-radius: 8px; border: 1px solid #2e2e33; margin-bottom: 32px; text-align: center;'>
                    <p style='word-break: break-all; font-size: 16px; font-weight: bold; color: #ffffff; margin: 0; font-family: monospace; letter-spacing: 1px;'>
                        {token}
                    </p>
                </div>

                <p style='font-size: 14px; color: #71717a; margin: 0 0 8px 0;'>
                    Si el botón anterior no funciona, copia y pega el siguiente enlace en tu navegador:
                </p>

                <div style='background-color: #242427; padding: 14px; border-radius: 8px; border: 1px solid #2e2e33; margin-bottom: 32px;'>
                    <p style='word-break: break-all; font-size: 13px; color: #a1a1aa; margin: 0; font-family: monospace;'>
                        {resetUrl}
                    </p>
                </div>

                <hr style='margin: 32px 0; border: none; border-top: 1px solid #2e2e33;' />

                <p style='font-size: 13px; color: #71717a; line-height: 1.5; margin: 0 0 12px 0;'>
                    Este enlace y token expirarán en 1 hora por motivos de seguridad.
                </p>

                <p style='font-size: 13px; color: #71717a; line-height: 1.5; margin: 0 0 32px 0;'>
                    Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual permanecerá segura y sin modificaciones.
                </p>

                <p style='font-size: 12px; color: #52525b; text-align: center; margin: 0;'>
                    © {DateTime.Now.Year} Brasa 33. Todos los derechos reservados.
                </p>

            </div>
            ";
        await SendEmailAsync(email, subject, body);
    }

    public async Task SendWelcomeEmailAsync(string email, string username)
    {
        var subject = "¡Bienvenido a BRASA 33!";

        var body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px 30px; background-color: #16161a; border-radius: 12px; color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.3);'>

                <div style='text-align: center; padding-bottom: 30px;'>
                    <h2 style='color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: 0.5px;'>¡Bienvenido a Brasa 33, {username}!</h2>
                    <p style='color: #71717a; font-size: 14px; margin-top: 8px;'>Registro Completado</p>
                </div>

                <p style='font-size: 16px; color: #e4e4e7; line-height: 1.5; margin: 0 0 16px 0;'>
                    ¡Excelente noticia! Tu cuenta ha sido <strong>verificada y activada correctamente</strong>.
                </p>

                <p style='font-size: 15px; color: #a1a1aa; line-height: 1.6; margin: 0 0 24px 0;'>
                    Ahora puedes acceder a todas las funciones de nuestra plataforma y disfrutar de la experiencia completa que el panel de administración tiene para ti.
                </p>

                <div style='background-color: #242427; padding: 20px; border-radius: 8px; border: 1px solid #2e2e33; margin: 32px 0;'>
                    <p style='margin: 0 0 8px 0; font-size: 14px; color: #e4e4e7; font-weight: 600;'>
                        ¿Necesitas ayuda?
                    </p>
                    <p style='margin: 0 12px 0 0; font-size: 14px; color: #a1a1aa; line-height: 1.5;'>
                        Si tienes alguna duda o necesitas asistencia técnica, nuestro equipo de soporte está listo para ayudarte en:
                    </p>
                    <p style='margin: 12px 0 0 0; font-size: 14px; font-weight: bold;'>
                        <a href='mailto:la33code@gmail.com' style='color: #ffffff; text-decoration: underline;'>
                            la33code@gmail.com
                        </a>
                    </p>
                </div>

                <p style='font-size: 15px; color: #a1a1aa; line-height: 1.6; margin: 0 0 32px 0;'>
                    Gracias por confiar en nuestro sistema y formar parte de la plataforma.
                </p>

                <hr style='margin: 32px 0; border: none; border-top: 1px solid #2e2e33;' />

                <p style='font-size: 12px; color: #52525b; text-align: center; margin: 0;'>
                    © {DateTime.Now.Year} Brasa 33. Todos los derechos reservados.
                </p>

            </div>
            ";
        await SendEmailAsync(email, subject, body);
    }

    private async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpSettings = configuration.GetSection("SmtpSettings");

        try
        {
            // Verificar si el email está habilitado
            var enabled = bool.Parse(smtpSettings["Enabled"] ?? "true");
            if (!enabled)
            {
                logger.LogInformation("El envío de emails está deshabilitado en la configuración. Omitiendo envío");
                return;
            }

            // Validar configuración
            var host = smtpSettings["Host"];
            var portString = smtpSettings["Port"];
            var username = smtpSettings["Username"];
            var password = smtpSettings["Password"];
            var fromEmail = smtpSettings["FromEmail"];
            var fromName = smtpSettings["FromName"];

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                logger.LogError("La configuración SMTP no está configurada correctamente");
                throw new InvalidOperationException("La configuración SMTP no está configurada correctamente");
            }

            // Avoid logging sensitive SMTP details

            var port = int.Parse(portString ?? "587");

            var protocolLogPath = smtpSettings["ProtocolLogPath"];
            if (!string.IsNullOrWhiteSpace(protocolLogPath))
            {
                var logDir = Path.GetDirectoryName(protocolLogPath);
                if (!string.IsNullOrWhiteSpace(logDir))
                {
                    Directory.CreateDirectory(logDir);
                }
                logger.LogInformation("SMTP protocol logging enabled at {ProtocolLogPath}", protocolLogPath);
            }

            using var protocolLogger = !string.IsNullOrWhiteSpace(protocolLogPath)
                ? new ProtocolLogger(protocolLogPath)
                : null;

            using var client = protocolLogger != null
                ? new SmtpClient(protocolLogger)
                : new SmtpClient();

            // Configurar timeout
            var timeoutMs = int.Parse(smtpSettings["Timeout"] ?? "30000");
            client.Timeout = timeoutMs;

            try
            {
                // Configurar validación de certificados SSL
                var ignoreCertErrors = bool.Parse(smtpSettings["IgnoreCertificateErrors"] ?? "false");
                if (ignoreCertErrors)
                {
                    logger.LogWarning("Validación de certificados SSL deshabilitada. Solo usar en desarrollo.");
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                }

                // Verificar configuración de SSL implícito
                var useImplicitSsl = bool.Parse(smtpSettings["UseImplicitSsl"] ?? "false");

                // Configuración específica por puerto y SSL
                if (useImplicitSsl || port == 465)
                {
                    await client.ConnectAsync(host, port, SecureSocketOptions.SslOnConnect);
                }
                else if (port == 587)
                {
                    await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
                }
                else
                {
                    await client.ConnectAsync(host, port, SecureSocketOptions.Auto);
                }

                // Autenticación
                await client.AuthenticateAsync(username, password);

                // Crear mensaje con MimeKit
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;
                message.Body = new TextPart("html") { Text = body };

                // Enviar
                await client.SendAsync(message);
                logger.LogInformation("Email enviado exitosamente");

                await client.DisconnectAsync(true);
                logger.LogInformation("Pipeline de email completado");
            }
            catch (MailKit.Security.AuthenticationException authEx)
            {
                logger.LogError(authEx, "La autenticación de Gmail falló. Verifica la contraseña de aplicación.");
                throw new InvalidOperationException($"La autenticación de Gmail falló: {authEx.Message}. Por favor, verifica la contraseña de aplicación.", authEx);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al enviar el email");
                throw;
            }
            logger.LogInformation("Email processed");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al enviar el email");

            // Verificar si usar fallback
            var useFallback = bool.Parse(smtpSettings["UseFallback"] ?? "false");
            if (useFallback)
            {
                logger.LogWarning("Usando respaldo de email");
                return; // No fallar, solo logear
            }

            throw new InvalidOperationException($"Error al enviar el email: {ex.Message}", ex);
        }
    }
}

