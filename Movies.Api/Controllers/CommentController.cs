using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Services;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;
using System.Security.Claims;
using Movies.Application.Interfaces;
using Movies.Application.Models;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/movies/{movieId:guid}/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpPost]
    [Authorize(Roles = "user,trusted_user")]
    public async Task<IActionResult> CreateComment(
        [FromRoute] Guid movieId,
        [FromBody] CreateCommentRequest request,
        CancellationToken token = default)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var comment = await _commentService.CreateCommentAsync(movieId, userId.Value, request.Content, token);
        
        return comment != null 
            ? Ok(MapToResponse(comment))
            : BadRequest("Failed to create comment");
    }

    [HttpPut("{commentId:guid}")]
    [Authorize(Roles = "user,trusted_user")]
    public async Task<IActionResult> UpdateComment(
        [FromRoute] Guid movieId,
        [FromRoute] Guid commentId,
        [FromBody] UpdateCommentRequest request,
        CancellationToken token = default)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var comment = await _commentService.UpdateCommentAsync(commentId, userId.Value, request.Content, token);
        
        if (comment == null)
            return NotFound("Comment not found or you don't have permission to update it");

        return Ok(MapToResponse(comment));
    }

    [HttpDelete("{commentId:guid}")]
    [Authorize(Roles = "user,trusted_user")]
    public async Task<IActionResult> DeleteComment(
        [FromRoute] Guid movieId,
        [FromRoute] Guid commentId,
        CancellationToken token = default)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var success = await _commentService.DeleteCommentAsync(commentId, userId.Value, token);
        
        return success 
            ? Ok(new { Message = "Comment deleted successfully" })
            : NotFound("Comment not found or you don't have permission to delete it");
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetMovieComments(
        [FromRoute] Guid movieId,
        CancellationToken token = default)
    {
        var comments = await _commentService.GetCommentsByMovieIdAsync(movieId, token);
        var response = comments.Select(MapToResponse);
        return Ok(response);
    }

    [HttpGet("{commentId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetComment(
        [FromRoute] Guid movieId,
        [FromRoute] Guid commentId,
        CancellationToken token = default)
    {
        var comment = await _commentService.GetCommentByIdAsync(commentId, token);
        
        if (comment == null || comment.MovieId != movieId)
            return NotFound();

        return Ok(MapToResponse(comment));
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst("userId");
        return userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId) 
            ? userId 
            : null;
    }

    private static CommentResponse MapToResponse(Comment comment)
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