using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;

namespace Movies.Api.Controllers;

[Route("api/emails")]
[ApiController]
public class EmailsController : ControllerBase
{
    private readonly IEmailService _emailService;

    public EmailsController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<IActionResult> SendEmail([FromBody] EmailRequest request)
    {
        await _emailService.SendEmail(request.Receptor, request.Subject, request.Body);
        return Ok();
    }

    public record EmailRequest(string Receptor, string Subject, string Body);
}