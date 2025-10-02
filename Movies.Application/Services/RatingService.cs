using Movies.Application.Interfaces;
using Movies.Application.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Movies.Application.Services
{
    public class RatingService : IRatingService
    {
        private readonly IRatingRepository _ratingRepository;

        public RatingService(IRatingRepository ratingRepository)
        {
            _ratingRepository = ratingRepository;
        }

        public async Task<bool> RateMovieAsync(Guid movieId, Guid userId, int value, CancellationToken cancellationToken = default)
        {
            if (value < 1 || value > 5) return false;

            var rating = new Rating
            {
                Id = Guid.NewGuid(),
                MovieId = movieId,
                UserId = userId,
                Value = value,
                CreatedAt = DateTime.UtcNow
            };

            return await _ratingRepository.AddOrUpdateRatingAsync(rating);
        }

        public async Task<double?> GetMovieRatingAsync(Guid movieId, CancellationToken cancellationToken = default)
        {
            return await _ratingRepository.GetMovieAverageRatingAsync(movieId);
        }
    }
}