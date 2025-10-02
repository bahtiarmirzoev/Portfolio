using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using System;
using System.Threading.Tasks;

namespace Movies.Application.Repositories
{
    public class RatingRepository : IRatingRepository
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public RatingRepository(IDbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task<bool> AddOrUpdateRatingAsync(Rating rating)
        {
            const string sql = """
                insert into ratings (id, "userId", "movieId", value, "createdAt")
                values (@Id, @UserId, @MovieId, @Value, @CreatedAt)
                on conflict ("userId", "movieId") 
                do update set value = excluded.value, "createdAt" = excluded."createdAt";
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var affected = await connection.ExecuteAsync(sql, rating);
            return affected > 0;
        }

        public async Task<double?> GetMovieAverageRatingAsync(Guid movieId)
        {
            const string sql = """
                select avg(value)::float 
                from ratings 
                where "movieId" = @MovieId;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.ExecuteScalarAsync<double?>(sql, new { MovieId = movieId });
        }

        public async Task<int?> GetUserRatingAsync(Guid userId, Guid movieId)
        {
            const string sql = """
                select value 
                from ratings 
                where "userId" = @UserId and "movieId" = @MovieId;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<int?>(sql, new { UserId = userId, MovieId = movieId });
        }
    }
}
