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

        // Movies
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

        // Series
        public async Task<bool> AddSeriesToFavoritesAsync(Guid userId, Guid seriesId)
        {
            var alreadyExists = await _favoriteRepository.IsSeriesInFavoritesAsync(userId, seriesId);
            if (alreadyExists) return false;

            var favorite = new FavoriteSeries
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                SeriesId = seriesId,
            };

            return await _favoriteRepository.AddSeriesToFavoritesAsync(favorite);
        }

        public async Task<bool> RemoveSeriesFromFavoritesAsync(Guid userId, Guid seriesId)
        {
            return await _favoriteRepository.RemoveSeriesFromFavoritesAsync(userId, seriesId);
        }

        public async Task<IEnumerable<Guid>> GetUserFavoriteSeriesAsync(Guid userId, int page, int pageSize)
        {
            var favorites = await _favoriteRepository.GetUserFavoriteSeriesAsync(userId);

            return favorites
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(f => f.SeriesId);
        }
    }
}