// Movies.Api/Controllers/SeriesCommentsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;
using System.Security.Claims;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/series/{seriesId:guid}/comments")]
public class SeriesCommentsController : ControllerBase
{
    private readonly ISeriesCommentService _commentService;

    public SeriesCommentsController(ISeriesCommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpPost]
    [Authorize(Roles = "user,trusted_user,admin")]
    public async Task<IActionResult> CreateComment(
        [FromRoute] Guid seriesId,
        [FromBody] CreateSeriesCommentRequest request,
        CancellationToken token = default)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var comment = await _commentService.CreateCommentAsync(seriesId, userId.Value, request.Content, token);
        
        return comment != null 
            ? Ok(MapToResponse(comment))
            : BadRequest("Failed to create comment");
    }

    [HttpPut("{commentId:guid}")]
    [Authorize(Roles = "user,trusted_user,admin")]
    public async Task<IActionResult> UpdateComment(
        [FromRoute] Guid seriesId,
        [FromRoute] Guid commentId,
        [FromBody] UpdateSeriesCommentRequest request,
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
    [Authorize(Roles = "user,trusted_user,admin")]
    public async Task<IActionResult> DeleteComment(
        [FromRoute] Guid seriesId,
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
    public async Task<IActionResult> GetSeriesComments(
        [FromRoute] Guid seriesId,
        CancellationToken token = default)
    {
        var comments = await _commentService.GetCommentsBySeriesIdAsync(seriesId, token);
        var response = comments.Select(MapToResponse);
        return Ok(response);
    }

    [HttpGet("{commentId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetComment(
        [FromRoute] Guid seriesId,
        [FromRoute] Guid commentId,
        CancellationToken token = default)
    {
        var comment = await _commentService.GetCommentByIdAsync(commentId, token);
        
        if (comment == null || comment.SeriesId != seriesId)
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

    private static SeriesCommentResponse MapToResponse(SeriesComment comment)
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