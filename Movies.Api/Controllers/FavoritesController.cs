using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Services;
using System.Security.Claims;

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

        [HttpPost("{movieId:guid}")]
        public async Task<IActionResult> AddToFavorites(Guid movieId)
        {
            var userId = GetCurrentUserId();
            var result = await _favoriteService.AddToFavoritesAsync(userId, movieId);
            
            return result 
                ? Ok() 
                : Conflict("Movie already in favorites");
        }

        [HttpDelete("{movieId:guid}")]
        public async Task<IActionResult> RemoveFromFavorites(Guid movieId)
        {
            var userId = GetCurrentUserId();
            var result = await _favoriteService.RemoveFromFavoritesAsync(userId, movieId);
            
            return result 
                ? NoContent() 
                : NotFound("Movie not found in favorites");
        }

        [HttpGet]
        public async Task<IActionResult> GetFavorites([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = GetCurrentUserId();
            var favorites = await _favoriteService.GetUserFavoritesAsync(userId, page, pageSize);
            
            return Ok(favorites);
        }

        private Guid GetCurrentUserId()
        {
            return Guid.Parse(User.FindFirstValue("userId"));
        }
    }
}