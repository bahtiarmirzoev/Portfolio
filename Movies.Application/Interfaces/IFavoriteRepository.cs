using Movies.Application.Models;

namespace Movies.Application.Interfaces;

public interface IFavoriteRepository
{
    Task<bool> AddToFavoritesAsync(FavoriteMovie favorite);
    Task<bool> RemoveFromFavoritesAsync(Guid userId, Guid movieId);
    Task<IEnumerable<FavoriteMovie>> GetUserFavoritesAsync(Guid userId);
    Task<bool> IsMovieInFavoritesAsync(Guid userId, Guid movieId);
    
    Task<bool> AddSeriesToFavoritesAsync(FavoriteSeries favorite);
    Task<bool> RemoveSeriesFromFavoritesAsync(Guid userId, Guid seriesId);
    Task<IEnumerable<FavoriteSeries>> GetUserFavoriteSeriesAsync(Guid userId);
    Task<bool> IsSeriesInFavoritesAsync(Guid userId, Guid seriesId);
}