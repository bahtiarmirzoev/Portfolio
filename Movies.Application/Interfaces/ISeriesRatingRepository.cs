using Movies.Application.Models;

namespace Movies.Application.Interfaces;

public interface ISeriesRatingRepository
{
    Task<bool> AddOrUpdateRatingAsync(SeriesRating rating);
    Task<double?> GetSeriesAverageRatingAsync(Guid seriesId);
    Task<int?> GetUserRatingAsync(Guid userId, Guid seriesId);
    Task<IEnumerable<SeriesRating>> GetUserRatingsAsync(Guid userId);
}