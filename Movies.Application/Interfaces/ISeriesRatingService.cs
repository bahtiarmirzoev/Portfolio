namespace Movies.Application.Interfaces;

public interface ISeriesRatingService
{
    Task<bool> RateSeriesAsync(Guid seriesId, Guid userId, int value, CancellationToken cancellationToken = default);
    Task<double?> GetSeriesRatingAsync(Guid seriesId, CancellationToken cancellationToken = default);
    Task<int?> GetUserSeriesRatingAsync(Guid seriesId, Guid userId, CancellationToken cancellationToken = default);
}