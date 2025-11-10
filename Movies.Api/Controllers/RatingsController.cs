using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Services;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;
using System.Security.Claims;
using Movies.Application.Interfaces;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/movies/{movieId:guid}/ratings")]
public class RatingsController : ControllerBase
{
    private readonly IRatingService _ratingService;

    public RatingsController(IRatingService ratingService)
    {
        _ratingService = ratingService;
    }

    [HttpPost]
    [Authorize(Roles = "trusted_user , admin"  )]
    public async Task<IActionResult> RateMovie(
        [FromRoute] Guid movieId,
        [FromBody] RatingRequest request,
        CancellationToken token = default)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var success = await _ratingService.RateMovieAsync(movieId, userId.Value, request.Value, token);
        
        return success 
            ? Ok(new { Message = "Movie rated successfully" })
            : BadRequest("Failed to rate movie");
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetMovieRating(
        [FromRoute] Guid movieId,
        CancellationToken token = default)
    {
        var rating = await _ratingService.GetMovieRatingAsync(movieId, token);
        return Ok(new { AverageRating = rating });
    }

    [HttpGet("my")]
    [Authorize(Roles = "user,trusted_user,admin")]
    public async Task<IActionResult> GetMyRating(
        [FromRoute] Guid movieId,
        CancellationToken token = default)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var rating = await _ratingService.GetUserRatingAsync(userId.Value, movieId, token);
        return Ok(new { MyRating = rating, Value = rating });
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst("userId");
        return userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId) 
            ? userId 
            : null;
    }
}