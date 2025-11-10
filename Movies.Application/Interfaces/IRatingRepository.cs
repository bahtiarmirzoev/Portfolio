using Movies.Application.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Movies.Application.Interfaces
{
    public interface IRatingRepository
    {
        Task<bool> AddOrUpdateRatingAsync(Rating rating);
        Task<double?> GetMovieAverageRatingAsync(Guid movieId);
        Task<int?> GetUserRatingAsync(Guid userId, Guid movieId);
        Task<IEnumerable<Rating>> GetUserRatingsAsync(Guid userId);
    }
}