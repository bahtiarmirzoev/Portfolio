using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Movies.Application.Models;

namespace Movies.Application.Interfaces
{
    public interface IRatingService
    {
        Task<bool> RateMovieAsync(Guid movieId, Guid userId, int value, CancellationToken cancellationToken = default);
        Task<double?> GetMovieRatingAsync(Guid movieId, CancellationToken cancellationToken = default);
        Task<int?> GetUserRatingAsync(Guid userId, Guid movieId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Rating>> GetUserRatingsAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}