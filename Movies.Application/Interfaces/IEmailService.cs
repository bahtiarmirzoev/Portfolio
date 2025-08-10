namespace Movies.Application.Interfaces;

public interface IEmailService
{
    Task SendConfirmationEmail(string toEmail, Guid userId, string token);
}
