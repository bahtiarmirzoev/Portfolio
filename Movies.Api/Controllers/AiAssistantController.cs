using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Movies.Application.Interfaces;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/ai")]
public class AiAssistantController : ControllerBase
{
    private readonly IAiAssistantService _aiAssistantService;
    private readonly ILogger<AiAssistantController> _logger;

    public AiAssistantController(IAiAssistantService aiAssistantService, ILogger<AiAssistantController> logger)
    {
        _aiAssistantService = aiAssistantService;
        _logger = logger;
    }

    [HttpGet("test")]
    [AllowAnonymous]
    public IActionResult Test()
    {
        return Ok(new ChatResponse { Response = "AI Assistant controller is working!" });
    }

    [HttpPost("chat")]
    [AllowAnonymous]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        try
        {
            _logger.LogInformation("Received chat request: {Message}", request.Message);
            
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new ChatResponse { Response = "Сообщение не может быть пустым" });
            }

            var response = await _aiAssistantService.GetRecommendationAsync(
                request.Message, 
                request.Preferences);

            return Ok(new ChatResponse { Response = response });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat request");
            return StatusCode(500, new ChatResponse 
            { 
                Response = $"Ошибка: {ex.Message}" 
            });
        }
    }

    [HttpPost("question")]
    [AllowAnonymous]
    public async Task<IActionResult> AnswerQuestion([FromBody] ChatRequest request)
    {
        try
        {
            var response = await _aiAssistantService.AnswerQuestionAsync(request.Message);
            return Ok(new ChatResponse { Response = response });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ChatResponse 
            { 
                Response = $"Ошибка: {ex.Message}" 
            });
        }
    }
}

