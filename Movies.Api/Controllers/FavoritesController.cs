using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Services;
using System.Security.Claims;
using Movies.Application.Interfaces;

namespace Movies.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoriteService _favoriteService;

        public FavoritesController(IFavoriteService favoriteService)
        {
            _favoriteService = favoriteService;
        }

        // Movies
        [HttpPost("movies/{movieId:guid}")]
        public async Task<IActionResult> AddMovieToFavorites(Guid movieId)
        {
            var userId = GetCurrentUserId();
            var result = await _favoriteService.AddToFavoritesAsync(userId, movieId);
            
            return result 
                ? Ok() 
                : Conflict("Movie already in favorites");
        }

        [HttpDelete("movies/{movieId:guid}")]
        public async Task<IActionResult> RemoveMovieFromFavorites(Guid movieId)
        {
            var userId = GetCurrentUserId();
            var result = await _favoriteService.RemoveFromFavoritesAsync(userId, movieId);
            
            return result 
                ? NoContent() 
                : NotFound("Movie not found in favorites");
        }

        [HttpGet("movies")]
        public async Task<IActionResult> GetFavoriteMovies([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = GetCurrentUserId();
            var favorites = await _favoriteService.GetUserFavoritesAsync(userId, page, pageSize);
            
            return Ok(favorites);
        }

        // Series
        [HttpPost("series/{seriesId:guid}")]
        public async Task<IActionResult> AddSeriesToFavorites(Guid seriesId)
        {
            var userId = GetCurrentUserId();
            var result = await _favoriteService.AddSeriesToFavoritesAsync(userId, seriesId);
            
            return result 
                ? Ok() 
                : Conflict("Series already in favorites");
        }

        [HttpDelete("series/{seriesId:guid}")]
        public async Task<IActionResult> RemoveSeriesFromFavorites(Guid seriesId)
        {
            var userId = GetCurrentUserId();
            var result = await _favoriteService.RemoveSeriesFromFavoritesAsync(userId, seriesId);
            
            return result 
                ? NoContent() 
                : NotFound("Series not found in favorites");
        }

        [HttpGet("series")]
        public async Task<IActionResult> GetFavoriteSeries([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = GetCurrentUserId();
            var favorites = await _favoriteService.GetUserFavoriteSeriesAsync(userId, page, pageSize);
            
            return Ok(favorites);
        }

        // Legacy endpoints for backward compatibility
        [HttpPost("{movieId:guid}")]
        public async Task<IActionResult> AddToFavorites(Guid movieId)
        {
            return await AddMovieToFavorites(movieId);
        }

        [HttpDelete("{movieId:guid}")]
        public async Task<IActionResult> RemoveFromFavorites(Guid movieId)
        {
            return await RemoveMovieFromFavorites(movieId);
        }

        [HttpGet]
        public async Task<IActionResult> GetFavorites([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            return await GetFavoriteMovies(page, pageSize);
        }

        private Guid GetCurrentUserId()
        {
            return Guid.Parse(User.FindFirstValue("userId"));
        }
    }
}