using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;

namespace Movies.Application.Repositories;

public class SeriesCommentRepository : ISeriesCommentRepository
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    public SeriesCommentRepository(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<SeriesComment?> CreateCommentAsync(SeriesComment comment, CancellationToken cancellationToken = default)
    {
        const string sql = """
            INSERT INTO series_comments (id, seriesid, userid, content, createdat, updatedat)
            VALUES (@Id, @SeriesId, @UserId, @Content, @CreatedAt, @UpdatedAt)
            RETURNING *;
        """;

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<SeriesComment>(sql, comment);
    }

    public async Task<SeriesComment?> UpdateCommentAsync(SeriesComment comment, CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE series_comments 
            SET content = @Content, updatedat = @UpdatedAt
            WHERE id = @Id AND userid = @UserId
            RETURNING *;
        """;

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<SeriesComment>(sql, comment);
    }

    public async Task<bool> DeleteCommentAsync(Guid commentId, CancellationToken cancellationToken = default)
    {
        const string sql = """
            DELETE FROM series_comments 
            WHERE id = @Id;
        """;

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        var affected = await connection.ExecuteAsync(sql, new { Id = commentId });
        return affected > 0;
    }

    public async Task<SeriesComment?> GetCommentByIdAsync(Guid commentId, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT * FROM series_comments 
            WHERE id = @Id;
        """;

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<SeriesComment>(sql, new { Id = commentId });
    }

    public async Task<IEnumerable<SeriesComment>> GetCommentsBySeriesIdAsync(Guid seriesId, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT * FROM series_comments 
            WHERE seriesid = @SeriesId
            ORDER BY createdat DESC;
        """;

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        return await connection.QueryAsync<SeriesComment>(sql, new { SeriesId = seriesId });
    }

    public async Task<IEnumerable<SeriesComment>> GetCommentsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT * FROM series_comments 
            WHERE userid = @UserId
            ORDER BY createdat DESC;
        """;

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        return await connection.QueryAsync<SeriesComment>(sql, new { UserId = userId });
    }
}