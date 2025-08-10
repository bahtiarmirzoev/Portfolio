using System.Net;
using System.Net.Mail;
using Movies.Application.Interfaces;

namespace Movies.Application.Services;

public class EmailService : IEmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPass;
    private readonly string _fromEmail;
    private readonly string _frontendBaseUrl;

    public EmailService(
        string smtpHost,
        int smtpPort,
        string smtpUser,
        string smtpPass,
        string fromEmail,
        string frontendBaseUrl)
    {
        _smtpHost = smtpHost;
        _smtpPort = smtpPort;
        _smtpUser = smtpUser;
        _smtpPass = smtpPass;
        _fromEmail = fromEmail;
        _frontendBaseUrl = frontendBaseUrl; // например: https://myapp.com
    }

    public async Task SendConfirmationEmail(string toEmail, Guid userId, string token)
    {
        using var client = new SmtpClient(_smtpHost, _smtpPort)
        {
            Credentials = new NetworkCredential(_smtpUser, _smtpPass),
            EnableSsl = true
        };

        var confirmationLink = $"{_frontendBaseUrl}/confirm-email?userId={userId}&token={token}";
        var body = $@"
            <h2>Подтверждение Email</h2>
            <p>Для подтверждения вашего аккаунта перейдите по ссылке ниже:</p>
            <a href='{confirmationLink}'>Подтвердить Email</a>
            <p>Ссылка действительна 24 часа.</p>
        ";

        var mail = new MailMessage(_fromEmail, toEmail)
        {
            Subject = "Подтверждение регистрации",
            Body = body,
            IsBodyHtml = true
        };

        await client.SendMailAsync(mail);
    }
}