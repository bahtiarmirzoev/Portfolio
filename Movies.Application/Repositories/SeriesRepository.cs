using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using System.Linq;

namespace Movies.Application.Repositories;

public class SeriesRepository : ISeriesRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public SeriesRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<bool> CreateSeriesAsync(Series series)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        var result = await connection.ExecuteAsync("""
            INSERT INTO series (id, slug, title, yearofrelease, yearofend, description, 
                posterurl, trailerurl, totalseasons, totalepisodes, isongoing)
            VALUES (@Id, @Slug, @Title, @YearOfRelease, @YearOfEnd, @Description, 
                @PosterUrl, @TrailerUrl, @TotalSeasons, @TotalEpisodes, @IsOngoing)
        """, series, transaction);

        if (result > 0 && series.Genres.Any())
        {
            foreach (var genre in series.Genres)
            {
                await connection.ExecuteAsync("""
                    INSERT INTO series_genres (seriesid, name)
                    VALUES (@SeriesId, @Name)
                """, new { SeriesId = series.Id, Name = genre }, transaction);
            }
        }

        if (result > 0 && series.Actors.Any())
        {
            foreach (var actor in series.Actors)
            {
                var actorExists = await connection.ExecuteScalarAsync<bool>(
                    "SELECT COUNT(1) FROM actors WHERE id = @Id", 
                    new { actor.Id }, transaction);
            
                if (!actorExists)
                {
                    await connection.ExecuteAsync("""
                        INSERT INTO actors (id, name)
                        VALUES (@Id, @Name)
                    """, new { actor.Id, actor.Name }, transaction);
                }

                await connection.ExecuteAsync("""
                    INSERT INTO series_actors (seriesid, actorid)
                    VALUES (@SeriesId, @ActorId)
                """, new { 
                    SeriesId = series.Id, 
                    ActorId = actor.Id
                }, transaction);
            }
        }

        transaction.Commit();
        return result > 0;
    }

    public async Task<Series?> GetByIdAsync(Guid id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var series = await connection.QuerySingleOrDefaultAsync<Series>("""
            SELECT id, title, yearofrelease as YearOfRelease, yearofend as YearOfEnd,
                   slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl,
                   totalseasons as TotalSeasons, totalepisodes as TotalEpisodes, 
                   isongoing as IsOngoing
            FROM series WHERE id=@id
        """, new { id });
        
        if (series == null) return null;

        // Загружаем жанры
        var genres = await connection.QueryAsync<string>(
            "SELECT name FROM series_genres WHERE seriesid=@id", new { id });
        series.Genres = genres.ToList();

        // Рассчитываем средний рейтинг
        var avgRating = await connection.ExecuteScalarAsync<double?>(@"
            SELECT AVG(value)::float FROM series_ratings WHERE seriesid = @id
        ", new { id });
        series.AverageRating = avgRating;

        // Загружаем актеров
        var actorResults = await connection.QueryAsync<dynamic>(@"
            SELECT a.id, a.name
            FROM actors a 
            INNER JOIN series_actors sa ON a.id = sa.actorid 
            WHERE sa.seriesid = @id
        ", new { id });
        series.Actors = actorResults.Select(r => new Actor
        {
            Id = r.id,
            Name = r.name
        }).ToList();

        return series;
    }

    public async Task<Series?> GetBySlugAsync(string slug)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var series = await connection.QuerySingleOrDefaultAsync<Series>("""
            SELECT id, title, yearofrelease as YearOfRelease, yearofend as YearOfEnd,
                   slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl,
                   totalseasons as TotalSeasons, totalepisodes as TotalEpisodes, 
                   isongoing as IsOngoing
            FROM series WHERE slug=@slug
        """, new { slug });
        
        if (series == null) return null;

        // Загружаем жанры
        var genres = await connection.QueryAsync<string>(
            "SELECT name FROM series_genres WHERE seriesid=@id", new { id = series.Id });
        series.Genres = genres.ToList();

        // Рассчитываем средний рейтинг
        var avgRating = await connection.ExecuteScalarAsync<double?>(@"
            SELECT AVG(value)::float FROM series_ratings WHERE seriesid = @id
        ", new { id = series.Id });
        series.AverageRating = avgRating;

        // Загружаем актеров
        var actorResults = await connection.QueryAsync<dynamic>(@"
            SELECT a.id, a.name
            FROM actors a 
            INNER JOIN series_actors sa ON a.id = sa.actorid 
            WHERE sa.seriesid = @id
        ", new { id = series.Id });
        series.Actors = actorResults.Select(r => new Actor
        {
            Id = r.id,
            Name = r.name
        }).ToList();

        return series;
    }

    public async Task<IEnumerable<Series>> GetAllAsync()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var seriesList = await connection.QueryAsync<Series>("""
            SELECT id, title, yearofrelease as YearOfRelease, yearofend as YearOfEnd,
                   slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl,
                   totalseasons as TotalSeasons, totalepisodes as TotalEpisodes, 
                   isongoing as IsOngoing
            FROM series
        """);

        foreach (var series in seriesList)
        {
            // Загружаем жанры
            var genres = await connection.QueryAsync<string>(
                "SELECT name FROM series_genres WHERE seriesid=@id", new { id = series.Id });
            series.Genres = genres.ToList();

            // Рассчитываем средний рейтинг
            var avgRating = await connection.ExecuteScalarAsync<double?>(@"
                SELECT AVG(value)::float FROM series_ratings WHERE seriesid = @id
            ", new { id = series.Id });
            series.AverageRating = avgRating;

            // Загружаем актеров
            var actorResults = await connection.QueryAsync<dynamic>(@"
                SELECT a.id, a.name
                FROM actors a 
                INNER JOIN series_actors sa ON a.id = sa.actorid 
                WHERE sa.seriesid = @id
            ", new { id = series.Id });
            series.Actors = actorResults.Select(r => new Actor
            {
                Id = r.id,
                Name = r.name
            }).ToList();
        }

        return seriesList;
    }

    public async Task<bool> UpdateSeriesAsync(Series series)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        await connection.ExecuteAsync(
            "DELETE FROM series_genres WHERE seriesid=@id", new { id = series.Id }, transaction);
        await connection.ExecuteAsync(
            "DELETE FROM series_actors WHERE seriesid=@id", new { id = series.Id }, transaction);

        foreach (var genre in series.Genres)
        {
            await connection.ExecuteAsync("""
                INSERT INTO series_genres (seriesid, name) VALUES (@SeriesId, @Name)
            """, new { SeriesId = series.Id, Name = genre }, transaction);
        }

        foreach (var actor in series.Actors)
        {
            await connection.ExecuteAsync("""
                INSERT INTO series_actors (seriesid, actorid)
                VALUES (@SeriesId, @ActorId)
            """, new { 
                SeriesId = series.Id, 
                ActorId = actor.Id
            }, transaction);
        }

        var result = await connection.ExecuteAsync("""
            UPDATE series
            SET slug=@Slug, title=@Title, yearofrelease=@YearOfRelease, 
                yearofend=@YearOfEnd, description=@Description, 
                posterurl=@PosterUrl, trailerurl=@TrailerUrl,
                totalseasons=@TotalSeasons, totalepisodes=@TotalEpisodes,
                isongoing=@IsOngoing
            WHERE id=@Id
        """, series, transaction);

        transaction.Commit();
        return result > 0;
    }

    public async Task<bool> DeleteSeriesByIdAsync(Guid id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        await connection.ExecuteAsync(
            "DELETE FROM series_genres WHERE seriesid=@id", new { id }, transaction);
        await connection.ExecuteAsync(
            "DELETE FROM series_actors WHERE seriesid=@id", new { id }, transaction);
        var result = await connection.ExecuteAsync(
            "DELETE FROM series WHERE id=@id", new { id }, transaction);

        transaction.Commit();
        return result > 0;
    }

    public async Task<bool> ExistsByIdAsync(Guid id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var count = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM series WHERE id=@id", new { id });
        return count > 0;
    }

    public async Task<(IEnumerable<Series> series, int totalCount)> GetAllAsync(int skip, int take)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var totalCount = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM series");

        var seriesList = await connection.QueryAsync<Series>("""
            SELECT id, title, yearofrelease as YearOfRelease, yearofend as YearOfEnd,
                   slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl,
                   totalseasons as TotalSeasons, totalepisodes as TotalEpisodes, 
                   isongoing as IsOngoing
            FROM series 
            ORDER BY title 
            LIMIT @Take OFFSET @Skip
        """, new { Take = take, Skip = skip });

        foreach (var series in seriesList)
        {
            // Загружаем жанры
            var genres = await connection.QueryAsync<string>(
                "SELECT name FROM series_genres WHERE seriesid=@id", new { id = series.Id });
            series.Genres = genres.ToList();

            // Рассчитываем средний рейтинг
            var avgRating = await connection.ExecuteScalarAsync<double?>(@"
                SELECT AVG(value)::float FROM series_ratings WHERE seriesid = @id
            ", new { id = series.Id });
            series.AverageRating = avgRating;

            // Загружаем актеров
            var actorResults = await connection.QueryAsync<dynamic>(@"
                SELECT a.id, a.name
                FROM actors a 
                INNER JOIN series_actors sa ON a.id = sa.actorid 
                WHERE sa.seriesid = @id
            ", new { id = series.Id });
            series.Actors = actorResults.Select(r => new Actor
            {
                Id = r.id,
                Name = r.name
            }).ToList();
        }

        return (seriesList, totalCount);
    }

    public async Task<(IEnumerable<Series> series, int totalCount)> SearchAsync(
        string search, int skip, int take)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var totalCount = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM series WHERE title ILIKE @Search",
            new { Search = $"%{search}%" });

        var seriesList = await connection.QueryAsync<Series>("""
            SELECT id, title, yearofrelease as YearOfRelease, yearofend as YearOfEnd,
                   slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl,
                   totalseasons as TotalSeasons, totalepisodes as TotalEpisodes, 
                   isongoing as IsOngoing
            FROM series 
            WHERE title ILIKE @Search 
            ORDER BY title 
            LIMIT @Take OFFSET @Skip
        """, new { Search = $"%{search}%", Take = take, Skip = skip });

        foreach (var series in seriesList)
        {
            // Загружаем жанры
            var genres = await connection.QueryAsync<string>(
                "SELECT name FROM series_genres WHERE seriesid=@id", new { id = series.Id });
            series.Genres = genres.ToList();

            // Рассчитываем средний рейтинг
            var avgRating = await connection.ExecuteScalarAsync<double?>(@"
                SELECT AVG(value)::float FROM series_ratings WHERE seriesid = @id
            ", new { id = series.Id });
            series.AverageRating = avgRating;

            // Загружаем актеров
            var actorResults = await connection.QueryAsync<dynamic>(@"
                SELECT a.id, a.name
                FROM actors a 
                INNER JOIN series_actors sa ON a.id = sa.actorid 
                WHERE sa.seriesid = @id
            ", new { id = series.Id });
            series.Actors = actorResults.Select(r => new Actor
            {
                Id = r.id,
                Name = r.name
            }).ToList();
        }

        return (seriesList, totalCount);
    }
    
    public async Task<(IEnumerable<Series> series, int totalCount)> FilterAsync(
        string? genre, 
        int? yearFrom, 
        int? yearTo, 
        string? actor,
        int skip, 
        int take)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var whereConditions = new List<string>();
        var parameters = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(genre))
        {
            whereConditions.Add(
                "EXISTS (SELECT 1 FROM series_genres sg WHERE sg.seriesid = s.id AND sg.name = @Genre)");
            parameters.Add("Genre", genre);
        }

        if (yearFrom.HasValue)
        {
            whereConditions.Add("s.yearofrelease >= @YearFrom");
            parameters.Add("YearFrom", yearFrom.Value);
        }

        if (yearTo.HasValue)
        {
            whereConditions.Add("s.yearofrelease <= @YearTo");
            parameters.Add("YearTo", yearTo.Value);
        }

        if (!string.IsNullOrWhiteSpace(actor))
        {
            whereConditions.Add(@"EXISTS (
                SELECT 1 FROM series_actors sa 
                INNER JOIN actors a ON sa.actorid = a.id 
                WHERE sa.seriesid = s.id AND a.name ILIKE @Actor
            )");
            parameters.Add("Actor", $"%{actor}%");
        }

        var whereClause = whereConditions.Any() 
            ? "WHERE " + string.Join(" AND ", whereConditions)
            : string.Empty;

        var countSql = $@"SELECT COUNT(*) FROM series s {whereClause}";
        var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

        parameters.Add("Take", take);
        parameters.Add("Skip", skip);

        var seriesSql = $@"
            SELECT s.id, s.title, s.yearofrelease as YearOfRelease, s.yearofend as YearOfEnd,
                   s.slug, s.description, s.posterurl as PosterUrl, s.trailerurl as TrailerUrl,
                   s.totalseasons as TotalSeasons, s.totalepisodes as TotalEpisodes, 
                   s.isongoing as IsOngoing
            FROM series s 
            {whereClause}
            ORDER BY s.title 
            LIMIT @Take OFFSET @Skip";

        var seriesList = await connection.QueryAsync<Series>(seriesSql, parameters);

        foreach (var series in seriesList)
        {
            // Загружаем жанры
            var genres = await connection.QueryAsync<string>(
                "SELECT name FROM series_genres WHERE seriesid = @id", 
                new { id = series.Id });
            series.Genres = genres.ToList();

            // Рассчитываем средний рейтинг
            var avgRating = await connection.ExecuteScalarAsync<double?>(@"
                SELECT AVG(value)::float FROM series_ratings WHERE seriesid = @id
            ", new { id = series.Id });
            series.AverageRating = avgRating;

            // Загружаем актеров
            var actorResults = await connection.QueryAsync<dynamic>(@"
                SELECT a.id, a.name
                FROM actors a 
                INNER JOIN series_actors sa ON a.id = sa.actorid 
                WHERE sa.seriesid = @id
            ", new { id = series.Id });
            series.Actors = actorResults.Select(r => new Actor
            {
                Id = r.id,
                Name = r.name
            }).ToList();
        }

        return (seriesList, totalCount);
    }

    public async Task<(IEnumerable<Series> series, int totalCount)> GetOngoingAsync(int skip, int take)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var totalCount = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM series WHERE isongoing = true");

        var seriesList = await connection.QueryAsync<Series>("""
            SELECT id, title, yearofrelease as YearOfRelease, yearofend as YearOfEnd,
                   slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl,
                   totalseasons as TotalSeasons, totalepisodes as TotalEpisodes, 
                   isongoing as IsOngoing
            FROM series 
            WHERE isongoing = true
            ORDER BY title 
            LIMIT @Take OFFSET @Skip
        """, new { Take = take, Skip = skip });

        foreach (var series in seriesList)
        {
            // Загружаем жанры
            var genres = await connection.QueryAsync<string>(
                "SELECT name FROM series_genres WHERE seriesid=@id", new { id = series.Id });
            series.Genres = genres.ToList();

            // Рассчитываем средний рейтинг
            var avgRating = await connection.ExecuteScalarAsync<double?>(@"
                SELECT AVG(value)::float FROM series_ratings WHERE seriesid = @id
            ", new { id = series.Id });
            series.AverageRating = avgRating;

            // Загружаем актеров
            var actorResults = await connection.QueryAsync<dynamic>(@"
                SELECT a.id, a.name
                FROM actors a 
                INNER JOIN series_actors sa ON a.id = sa.actorid 
                WHERE sa.seriesid = @id
            ", new { id = series.Id });
            series.Actors = actorResults.Select(r => new Actor
            {
                Id = r.id,
                Name = r.name
            }).ToList();
        }

        return (seriesList, totalCount);
    }
}