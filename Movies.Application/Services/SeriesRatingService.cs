using Movies.Application.Interfaces;
using Movies.Application.Models;

namespace Movies.Application.Services;

public class SeriesRatingService : ISeriesRatingService
{
    private readonly ISeriesRatingRepository _ratingRepository;

    public SeriesRatingService(ISeriesRatingRepository ratingRepository)
    {
        _ratingRepository = ratingRepository;
    }

    public async Task<bool> RateSeriesAsync(Guid seriesId, Guid userId, int value, CancellationToken cancellationToken = default)
    {
        if (value < 1 || value > 5) return false;

        var rating = new SeriesRating
        {
            Id = Guid.NewGuid(),
            SeriesId = seriesId,
            UserId = userId,
            Value = value,
            CreatedAt = DateTime.UtcNow
        };

        return await _ratingRepository.AddOrUpdateRatingAsync(rating);
    }

    public async Task<double?> GetSeriesRatingAsync(Guid seriesId, CancellationToken cancellationToken = default)
    {
        return await _ratingRepository.GetSeriesAverageRatingAsync(seriesId);
    }

    public async Task<int?> GetUserSeriesRatingAsync(Guid seriesId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _ratingRepository.GetUserRatingAsync(userId, seriesId);
    }

    public async Task<IEnumerable<SeriesRating>> GetUserRatingsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _ratingRepository.GetUserRatingsAsync(userId);
    }
}