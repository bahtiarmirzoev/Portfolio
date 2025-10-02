using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/email")]
public class EmailsController : ControllerBase
{
    private readonly IEmailService _emailService;

    public EmailsController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendEmail(
        [FromBody] EmailRequest request,
        CancellationToken cancellationToken)
    {
        await _emailService.SendEmail(
            request.Recipient,
            request.Subject,
            request.Body);

        return Ok();
    }

    public record EmailRequest(
        string Recipient,
        string Subject,
        string Body);
}