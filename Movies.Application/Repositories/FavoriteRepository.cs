using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using System.Data;

namespace Movies.Application.Repositories
{
    public class FavoriteRepository : IFavoriteRepository
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public FavoriteRepository(IDbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task<bool> AddToFavoritesAsync(FavoriteMovie favorite)
        {
            const string sql = """
                insert into favoritemovies (id, userid, movieid )
                values (@Id, @UserId, @MovieId )
                on conflict ("userid", "movieid") do nothing;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var affectedRows = await connection.ExecuteAsync(sql, favorite);
            return affectedRows > 0;
        }

        public async Task<bool> RemoveFromFavoritesAsync(Guid userId, Guid movieId)
        {
            const string sql = """
                delete from "favoritemovies"
                where "userid" = @UserId and "movieid" = @MovieId;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var affectedRows = await connection.ExecuteAsync(sql, new { UserId = userId, MovieId = movieId });
            return affectedRows > 0;
        }

        public async Task<IEnumerable<FavoriteMovie>> GetUserFavoritesAsync(Guid userId)
        {
            const string sql = """
                select * from "favoritemovies"
                where "userid" = @UserId
                order by "createdat" desc;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QueryAsync<FavoriteMovie>(sql, new { UserId = userId });
        }

        public async Task<bool> IsMovieInFavoritesAsync(Guid userId, Guid movieId)
        {
            const string sql = """
                select exists(
                    select 1 from "favoritemovies"
                    where "userid" = @UserId and "movieid" = @MovieId
                );
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.ExecuteScalarAsync<bool>(sql, new { UserId = userId, MovieId = movieId });
        }
    }
}
