using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Movies.Application.Interfaces;

namespace Movies.Application.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly string _email;
    private readonly string _password;
    private readonly string _host;
    private readonly int _port;

    public EmailService(IConfiguration config)
    {
        _config = config;
        _email = _config["Email:Address"] ?? throw new ArgumentNullException("Email address not configured");
        _password = _config["Email:Password"] ?? throw new ArgumentNullException("Email password not configured");
        _host = _config["Email:Host"] ?? throw new ArgumentNullException("SMTP host not configured");
        _port = int.Parse(_config["Email:Port"] ?? throw new ArgumentNullException("SMTP port not configured"));
    }

    public async Task SendEmail(string recipient, string subject, string body)
    {
        using var client = new SmtpClient(_host, _port)
        {
            Credentials = new NetworkCredential(_email, _password),
            EnableSsl = true
        };

        using var message = new MailMessage(_email, recipient, subject, body);
        await client.SendMailAsync(message);
    }
}