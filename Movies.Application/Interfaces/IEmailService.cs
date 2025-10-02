namespace Movies.Application.Interfaces;

public interface IEmailService
{
    Task SendEmail(string recipient, string subject, string body);
}