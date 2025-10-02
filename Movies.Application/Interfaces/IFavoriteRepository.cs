public interface IFavoriteRepository
{
    Task<bool> AddToFavoritesAsync(FavoriteMovie favorite);
    Task<bool> RemoveFromFavoritesAsync(Guid userId, Guid movieId);
    Task<IEnumerable<FavoriteMovie>> GetUserFavoritesAsync(Guid userId);
    Task<bool> IsMovieInFavoritesAsync(Guid userId, Guid movieId);
}