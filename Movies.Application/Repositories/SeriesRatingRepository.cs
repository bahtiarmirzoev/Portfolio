// Movies.Application/Repositories/SeriesRatingRepository.cs
using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;

namespace Movies.Application.Repositories;

public class SeriesRatingRepository : ISeriesRatingRepository
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    public SeriesRatingRepository(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<bool> AddOrUpdateRatingAsync(SeriesRating rating)
    {
        const string sql = """
                               INSERT INTO series_ratings (id, userid, seriesid, value, createdat)
                               VALUES (@Id, @UserId, @SeriesId, @Value, @CreatedAt)
                               ON CONFLICT (userid, seriesid) 
                               DO UPDATE SET value = excluded.value, createdat = excluded.createdat;
                           """;

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        var affected = await connection.ExecuteAsync(sql, rating);
        return affected > 0;
    }

    public async Task<double?> GetSeriesAverageRatingAsync(Guid seriesId)
    {
        const string sql = """
                               SELECT AVG(value)::float 
                               FROM series_ratings 
                               WHERE seriesid = @SeriesId;
                           """;

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        return await connection.ExecuteScalarAsync<double?>(sql, new { SeriesId = seriesId });
    }

    public async Task<int?> GetUserRatingAsync(Guid userId, Guid seriesId)
    {
        const string sql = """
                               SELECT value 
                               FROM series_ratings 
                               WHERE userid = @UserId AND seriesid = @SeriesId;
                           """;

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        return await connection.QueryFirstOrDefaultAsync<int?>(sql, new { UserId = userId, SeriesId = seriesId });
    }
}