using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;
using Movies.Contracts.Responses;
using System.Linq;
using System.Security.Claims;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/movies/comments/my")]
[Authorize(Roles = "user,trusted_user,admin")]
public class UserCommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public UserCommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet]
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

    private static CommentResponse MapToResponse(Movies.Application.Models.Comment comment)
    {
        return new CommentResponse
        {
            Id = comment.Id,
            MovieId = comment.MovieId,
            UserId = comment.UserId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }
}

