using Movies.Application.Interfaces;
using Movies.Application.Models;

namespace Movies.Application.Services
{
    public class FavoriteService : IFavoriteService
    {
        private readonly IFavoriteRepository _favoriteRepository;

        public FavoriteService(IFavoriteRepository favoriteRepository)
        {
            _favoriteRepository = favoriteRepository;
        }

        public async Task<bool> AddToFavoritesAsync(Guid userId, Guid movieId)
        {
            
            var alreadyExists = await _favoriteRepository.IsMovieInFavoritesAsync(userId, movieId);
            if (alreadyExists) return false;

            var favorite = new FavoriteMovie
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                MovieId = movieId,
                
            };

            return await _favoriteRepository.AddToFavoritesAsync(favorite);
        }

        public async Task<bool> RemoveFromFavoritesAsync(Guid userId, Guid movieId)
        {
            return await _favoriteRepository.RemoveFromFavoritesAsync(userId, movieId);
        }

        public async Task<IEnumerable<Guid>> GetUserFavoritesAsync(Guid userId, int page, int pageSize)
        {
            var favorites = await _favoriteRepository.GetUserFavoritesAsync(userId);

           
            return favorites
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(f => f.MovieId);
        }
    }
}