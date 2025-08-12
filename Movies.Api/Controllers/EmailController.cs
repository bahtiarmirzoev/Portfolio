using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;
using Movies.Application.Repositories;
using System.Security.Cryptography;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailConfirmationController : ControllerBase
{
    private readonly IEmailConfirmationRepository _confirmationRepository;
    private readonly IEmailService _emailService;

    public EmailConfirmationController(
        IEmailConfirmationRepository confirmationRepository,
        IEmailService emailService)
    {
        _confirmationRepository = confirmationRepository;
        _emailService = emailService;
    }


    [HttpPost("send")]
    public async Task<IActionResult> SendConfirmationEmail([FromQuery] Guid userId, [FromQuery] string email)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

        var expiresAt = DateTime.UtcNow.AddHours(24);

        await _confirmationRepository.CreateAsync(userId, token, expiresAt);

        await _emailService.SendConfirmationEmail(email, userId, token);

        return Ok(new { message = "Письмо отправлено" });
    }

    [HttpGet("confirm")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] Guid userId, [FromQuery] string token)
    {
        var confirmed = await _confirmationRepository.ConfirmAsync(userId, token);
        if (!confirmed)
            return BadRequest(new { message = "Токен недействителен или просрочен" });

        return Ok(new { message = "Email успешно подтвержден" });
    }

  
    [HttpGet("check-token")]
    public async Task<IActionResult> CheckToken([FromQuery] Guid userId, [FromQuery] string token)
    {
        var exists = await _confirmationRepository.ExistsValidTokenAsync(userId, token);
        return Ok(new { valid = exists });
    }
}
