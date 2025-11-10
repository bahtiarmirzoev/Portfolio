using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using System;
using System.Collections.Generic;
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
                insert into ratings (id, userid, movieid, value, createdat)
                values (@Id, @UserId, @MovieId, @Value, @CreatedAt)
                on conflict (userid, movieid) 
                do update set value = excluded.value, createdat = excluded.createdat;
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
                where movieid = @MovieId;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.ExecuteScalarAsync<double?>(sql, new { MovieId = movieId });
        }

        public async Task<int?> GetUserRatingAsync(Guid userId, Guid movieId)
        {
            const string sql = """
                select value 
                from ratings 
                where userid = @UserId and movieid = @MovieId;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<int?>(sql, new { UserId = userId, MovieId = movieId });
        }

        public async Task<IEnumerable<Rating>> GetUserRatingsAsync(Guid userId)
        {
            const string sql = """
                select id, userid, movieid, value, createdat
                from ratings 
                where userid = @UserId
                order by createdat desc;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QueryAsync<Rating>(sql, new { UserId = userId });
        }
    }
}