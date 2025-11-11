using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;
using System.Security.Claims;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/series/ratings")]
[Authorize(Roles = "user,trusted_user,admin")]
public class UserSeriesRatingsController : ControllerBase
{
    private readonly ISeriesRatingService _ratingService;

    public UserSeriesRatingsController(ISeriesRatingService ratingService)
    {
        _ratingService = ratingService;
    }

    [HttpGet("my/all")]
    public async Task<IActionResult> GetMyRatings(CancellationToken token = default)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var ratings = await _ratingService.GetUserRatingsAsync(userId.Value, token);
        return Ok(ratings);
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst("userId");
        return userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId) 
            ? userId 
            : null;
    }
}

