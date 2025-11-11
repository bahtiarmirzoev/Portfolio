using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;
using Movies.Contracts.Responses;
using System.Linq;
using System.Security.Claims;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/series/comments")]
[Authorize(Roles = "user,trusted_user,admin")]
public class UserSeriesCommentsController : ControllerBase
{
    private readonly ISeriesCommentService _commentService;

    public UserSeriesCommentsController(ISeriesCommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyComments(CancellationToken token = default)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var comments = await _commentService.GetCommentsByUserIdAsync(userId.Value, token);
        var response = comments.Select(MapToResponse);
        return Ok(response);
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst("userId");
        return userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId) 
            ? userId 
            : null;
    }

    private static SeriesCommentResponse MapToResponse(Movies.Application.Models.SeriesComment comment)
    {
        return new SeriesCommentResponse
        {
            Id = comment.Id,
            SeriesId = comment.SeriesId,
            UserId = comment.UserId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }
}

