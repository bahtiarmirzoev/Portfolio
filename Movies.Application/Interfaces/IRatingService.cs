using System;
using System.Threading;
using System.Threading.Tasks;

namespace Movies.Application.Interfaces
{
    public interface IRatingService
    {
        Task<bool> RateMovieAsync(Guid movieId, Guid userId, int value, CancellationToken cancellationToken = default);
        Task<double?> GetMovieRatingAsync(Guid movieId, CancellationToken cancellationToken = default);
    }
}