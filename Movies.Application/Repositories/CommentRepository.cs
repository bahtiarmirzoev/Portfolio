using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Movies.Application.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public CommentRepository(IDbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task<Comment?> CreateCommentAsync(Comment comment, CancellationToken cancellationToken = default)
        {
            const string sql = """
                INSERT INTO comments (id, movieid, userid, content, createdat, updatedat)
                VALUES (@Id, @MovieId, @UserId, @Content, @CreatedAt, @UpdatedAt)
                RETURNING *;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QuerySingleOrDefaultAsync<Comment>(sql, comment);
        }

        public async Task<Comment?> UpdateCommentAsync(Comment comment, CancellationToken cancellationToken = default)
        {
            const string sql = """
                UPDATE comments 
                SET content = @Content, updatedat = @UpdatedAt
                WHERE id = @Id AND userid = @UserId
                RETURNING *;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QuerySingleOrDefaultAsync<Comment>(sql, comment);
        }

        public async Task<bool> DeleteCommentAsync(Guid commentId, CancellationToken cancellationToken = default)
        {
            const string sql = """
                DELETE FROM comments 
                WHERE id = @Id;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var affected = await connection.ExecuteAsync(sql, new { Id = commentId });
            return affected > 0;
        }

        public async Task<Comment?> GetCommentByIdAsync(Guid commentId, CancellationToken cancellationToken = default)
        {
            const string sql = """
                SELECT * FROM comments 
                WHERE id = @Id;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QuerySingleOrDefaultAsync<Comment>(sql, new { Id = commentId });
        }

        public async Task<IEnumerable<Comment>> GetCommentsByMovieIdAsync(Guid movieId, CancellationToken cancellationToken = default)
        {
            const string sql = """
                SELECT * FROM comments 
                WHERE movieid = @MovieId
                ORDER BY createdat DESC;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QueryAsync<Comment>(sql, new { MovieId = movieId });
        }

        public async Task<IEnumerable<Comment>> GetCommentsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            const string sql = """
                SELECT * FROM comments 
                WHERE userid = @UserId
                ORDER BY createdat DESC;
            """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QueryAsync<Comment>(sql, new { UserId = userId });
        }
    }
}