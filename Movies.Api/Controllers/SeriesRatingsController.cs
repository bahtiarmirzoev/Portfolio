
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;
using Movies.Contracts.Requests;
using System.Security.Claims;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/series/{seriesId:guid}/ratings")]
public class SeriesRatingsController : ControllerBase
{
    private readonly ISeriesRatingService _ratingService;

    public SeriesRatingsController(ISeriesRatingService ratingService)
    {
        _ratingService = ratingService;
    }

    [HttpPost]
    [Authorize(Roles = "trusted_user,admin")]
    public async Task<IActionResult> RateSeries(
        [FromRoute] Guid seriesId,
        [FromBody] SeriesRatingRequest request,
        CancellationToken token = default)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var success = await _ratingService.RateSeriesAsync(seriesId, userId.Value, request.Value, token);
        
        return success 
            ? Ok(new { Message = "Series rated successfully" })
            : BadRequest("Failed to rate series");
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetSeriesRating(
        [FromRoute] Guid seriesId,
        CancellationToken token = default)
    {
        var rating = await _ratingService.GetSeriesRatingAsync(seriesId, token);
        return Ok(new { AverageRating = rating });
    }

    [HttpGet("my")]
    [Authorize(Roles = "user,trusted_user,admin")]
    public async Task<IActionResult> GetMyRating(
        [FromRoute] Guid seriesId,
        CancellationToken token = default)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var rating = await _ratingService.GetUserSeriesRatingAsync(seriesId, userId.Value, token);
        return Ok(new { MyRating = rating });
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst("userId");
        return userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId) 
            ? userId 
            : null;
    }
}