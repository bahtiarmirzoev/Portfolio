namespace Movies.Application.Interfaces;

public interface IFavoriteService
{
    Task<bool> AddToFavoritesAsync(Guid userId, Guid movieId);
    Task<bool> RemoveFromFavoritesAsync(Guid userId, Guid movieId);
    Task<IEnumerable<Guid>> GetUserFavoritesAsync(Guid userId, int page, int pageSize);
    
    Task<bool> AddSeriesToFavoritesAsync(Guid userId, Guid seriesId);
    Task<bool> RemoveSeriesFromFavoritesAsync(Guid userId, Guid seriesId);
    Task<IEnumerable<Guid>> GetUserFavoriteSeriesAsync(Guid userId, int page, int pageSize);
}