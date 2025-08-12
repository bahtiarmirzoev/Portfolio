using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
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

    public EmailService(IOptions<EmailSettings> options)
    {
        var settings = options.Value;
        _smtpHost = settings.SmtpHost;
        _smtpPort = settings.SmtpPort;
        _smtpUser = settings.SmtpUser;
        _smtpPass = settings.SmtpPass;
        _fromEmail = settings.FromEmail;
        _frontendBaseUrl = settings.FrontendBaseUrl;
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