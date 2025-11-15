using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using System.Data;
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
                posterurl, trailerurl, watchurl, totalseasons, totalepisodes, isongoing)
            VALUES (@Id, @Slug, @Title, @YearOfRelease, @YearOfEnd, @Description, 
                @PosterUrl, @TrailerUrl, @WatchUrl, @TotalSeasons, @TotalEpisodes, @IsOngoing)
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
                // Проверяем существование актера по имени (case-insensitive)
                var existingActorId = await connection.QuerySingleOrDefaultAsync<Guid?>(
                    "SELECT id FROM actors WHERE LOWER(TRIM(name)) = LOWER(TRIM(@Name))", 
                    new { Name = actor.Name }, transaction);
            
                Guid actorIdToUse;
                if (existingActorId.HasValue)
                {
                    // Используем существующего актера
                    actorIdToUse = existingActorId.Value;
                }
                else
                {
                    // Создаем нового актера только с именем (без даты рождения и биографии)
                    actorIdToUse = actor.Id;
                    await connection.ExecuteAsync("""
                        INSERT INTO actors (id, name, dateofbirth, biography)
                        VALUES (@Id, @Name, NULL, NULL)
                    """, new { Id = actorIdToUse, Name = actor.Name.Trim() }, transaction);
                }

                // Проверяем, не существует ли уже связь
                var linkExists = await connection.ExecuteScalarAsync<bool>(
                    "SELECT COUNT(1) FROM series_actors WHERE seriesid = @SeriesId AND actorid = @ActorId",
                    new { SeriesId = series.Id, ActorId = actorIdToUse }, transaction);

                if (!linkExists)
                {
                    await connection.ExecuteAsync("""
                        INSERT INTO series_actors (seriesid, actorid)
                        VALUES (@SeriesId, @ActorId)
                    """, new { 
                        SeriesId = series.Id, 
                        ActorId = actorIdToUse
                    }, transaction);
                }
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
                   slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl,
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
                   slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl,
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
            // Проверяем существование актера по имени (case-insensitive)
            var existingActorId = await connection.QuerySingleOrDefaultAsync<Guid?>(
                "SELECT id FROM actors WHERE LOWER(TRIM(name)) = LOWER(TRIM(@Name))", 
                new { Name = actor.Name }, transaction);
        
            Guid actorIdToUse;
            if (existingActorId.HasValue)
            {
                // Используем существующего актера
                actorIdToUse = existingActorId.Value;
            }
            else
            {
                // Создаем нового актера только с именем (без даты рождения и биографии)
                actorIdToUse = actor.Id;
                await connection.ExecuteAsync("""
                    INSERT INTO actors (id, name, dateofbirth, biography)
                    VALUES (@Id, @Name, NULL, NULL)
                """, new { Id = actorIdToUse, Name = actor.Name.Trim() }, transaction);
            }

            // Проверяем, не существует ли уже связь
            var linkExists = await connection.ExecuteScalarAsync<bool>(
                "SELECT COUNT(1) FROM series_actors WHERE seriesid = @SeriesId AND actorid = @ActorId",
                new { SeriesId = series.Id, ActorId = actorIdToUse }, transaction);

            if (!linkExists)
            {
                await connection.ExecuteAsync("""
                    INSERT INTO series_actors (seriesid, actorid)
                    VALUES (@SeriesId, @ActorId)
                """, new { 
                    SeriesId = series.Id, 
                    ActorId = actorIdToUse
                }, transaction);
            }
        }

        var result = await connection.ExecuteAsync("""
            UPDATE series
            SET slug=@Slug, title=@Title, yearofrelease=@YearOfRelease, 
                yearofend=@YearOfEnd, description=@Description, 
                posterurl=@PosterUrl, trailerurl=@TrailerUrl, watchurl=@WatchUrl,
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

    public async Task<(IEnumerable<Series> series, int totalCount)> GetAllAsync(int skip, int take, string? sortBy = null, string? sortOrder = "asc")
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var totalCount = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM series");

        // Определяем ORDER BY в зависимости от sortBy
        var orderBy = GetOrderByClause(sortBy, sortOrder);

        var seriesList = await connection.QueryAsync<Series>($"""
            SELECT id, title, yearofrelease as YearOfRelease, yearofend as YearOfEnd,
                   slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl,
                   totalseasons as TotalSeasons, totalepisodes as TotalEpisodes, 
                   isongoing as IsOngoing
            FROM series 
            {orderBy}
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
        string search, int skip, int take, string? sortBy = null, string? sortOrder = "asc")
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var totalCount = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM series WHERE title ILIKE @Search",
            new { Search = $"%{search}%" });

        // Определяем ORDER BY в зависимости от sortBy
        var orderBy = GetOrderByClause(sortBy, sortOrder);

        var seriesList = await connection.QueryAsync<Series>($"""
            SELECT id, title, yearofrelease as YearOfRelease, yearofend as YearOfEnd,
                   slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl,
                   totalseasons as TotalSeasons, totalepisodes as TotalEpisodes, 
                   isongoing as IsOngoing
            FROM series 
            WHERE title ILIKE @Search 
            {orderBy}
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
        int take,
        string? sortBy = null,
        string? sortOrder = "asc")
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

        // Определяем ORDER BY в зависимости от sortBy
        var orderBy = GetOrderByClause(sortBy, sortOrder, "s");

        var seriesSql = $@"
            SELECT s.id, s.title, s.yearofrelease as YearOfRelease, s.yearofend as YearOfEnd,
                   s.slug, s.description, s.posterurl as PosterUrl, s.trailerurl as TrailerUrl, s.watchurl as WatchUrl,
                   s.totalseasons as TotalSeasons, s.totalepisodes as TotalEpisodes, 
                   s.isongoing as IsOngoing
            FROM series s 
            {whereClause}
            {orderBy}
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

    public async Task<(IEnumerable<Series> series, int totalCount)> GetOngoingAsync(int skip, int take, string? sortBy = null, string? sortOrder = "asc")
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var totalCount = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM series WHERE isongoing = true");

        // Определяем ORDER BY в зависимости от sortBy
        var orderBy = GetOrderByClause(sortBy, sortOrder);

        var seriesList = await connection.QueryAsync<Series>($"""
            SELECT id, title, yearofrelease as YearOfRelease, yearofend as YearOfEnd,
                   slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl,
                   totalseasons as TotalSeasons, totalepisodes as TotalEpisodes, 
                   isongoing as IsOngoing
            FROM series 
            WHERE isongoing = true
            {orderBy}
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
    
    public async Task<IEnumerable<Series>> GetSimilarSeriesAsync(Guid seriesId, int count = 5)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        var currentSeries = await GetByIdAsync(seriesId);
        if (currentSeries == null)
        {
            return Enumerable.Empty<Series>();
        }
        
        var genres = await connection.QueryAsync<string>(
            "SELECT name FROM series_genres WHERE seriesid = @SeriesId",
            new { SeriesId = seriesId });
        var genreList = genres.ToList();
        
        var actors = await connection.QueryAsync<Guid>(
            @"SELECT actorid FROM series_actors WHERE seriesid = @SeriesId",
            new { SeriesId = seriesId });
        var actorIds = actors.ToList();
        
        var yearOfRelease = currentSeries.YearOfRelease;
        
        // Fallback if no genres and actors are available for the current series
        if (!genreList.Any() && !actorIds.Any())
        {
            var similar = await connection.QueryAsync<Series>(
                @"SELECT id, title, yearofrelease as YearOfRelease, yearofend as YearOfEnd, slug, description, 
                         posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl,
                         totalseasons as TotalSeasons, totalepisodes as TotalEpisodes, 
                         isongoing as IsOngoing
                  FROM series 
                  WHERE id != @SeriesId 
                    AND yearofrelease BETWEEN @YearFrom AND @YearTo
                  ORDER BY ABS(yearofrelease - @YearOfRelease)
                  LIMIT @Count",
                new { 
                    SeriesId = seriesId, 
                    YearOfRelease = yearOfRelease,
                    YearFrom = yearOfRelease - 5, // Consider series within 5 years
                    YearTo = yearOfRelease + 5,
                    Count = count 
                });
            
            return await EnrichSeriesWithDetailsAsync(connection, similar);
        }
        
        // Build SQL query with relevance scoring
        var sql = @"
            WITH series_scores AS (
                SELECT 
                    s.id,
                    s.title,
                    s.yearofrelease as YearOfRelease,
                    s.yearofend as YearOfEnd,
                    s.slug,
                    s.description,
                    s.posterurl as PosterUrl,
                    s.trailerurl as TrailerUrl,
                    s.watchurl as WatchUrl,
                    s.totalseasons as TotalSeasons,
                    s.totalepisodes as TotalEpisodes,
                    s.isongoing as IsOngoing,
                    -- Score for matching genres (weight: 3 points per genre)
                    COALESCE((
                        SELECT COUNT(*) * 3
                        FROM series_genres sg
                        WHERE sg.seriesid = s.id 
                          AND (@GenresCount = 0 OR sg.name = ANY(@Genres))
                    ), 0) as genre_score,
                    -- Score for matching actors (weight: 2 points per actor)
                    COALESCE((
                        SELECT COUNT(*) * 2
                        FROM series_actors sa
                        WHERE sa.seriesid = s.id 
                          AND (@ActorIdsCount = 0 OR sa.actorid = ANY(@ActorIds))
                    ), 0) as actor_score,
                    -- Bonus for close year of release (weight: 1 point per year of proximity, max 5)
                    GREATEST(0, 5 - ABS(s.yearofrelease - @YearOfRelease)) as year_score
                FROM series s
                WHERE s.id != @SeriesId
            )
            SELECT 
                id,
                title,
                YearOfRelease,
                yearofend as YearOfEnd,
                slug,
                description,
                PosterUrl,
                TrailerUrl,
                WatchUrl,
                totalseasons as TotalSeasons,
                totalepisodes as TotalEpisodes,
                isongoing as IsOngoing,
                (genre_score + actor_score + year_score) as relevance_score
            FROM series_scores
            WHERE (genre_score + actor_score + year_score) > 0
            ORDER BY relevance_score DESC, title
            LIMIT @Count";
        
        var parameters = new DynamicParameters();
        parameters.Add("SeriesId", seriesId);
        parameters.Add("Genres", genreList.Any() ? genreList.ToArray() : new string[0]);
        parameters.Add("GenresCount", genreList.Count);
        parameters.Add("ActorIds", actorIds.Any() ? actorIds.ToArray() : new Guid[0]);
        parameters.Add("ActorIdsCount", actorIds.Count);
        parameters.Add("YearOfRelease", yearOfRelease);
        parameters.Add("Count", count);
        
        var similarSeries = await connection.QueryAsync<Series>(sql, parameters);
        var seriesList = similarSeries.ToList();
        
        // If not enough series found by relevance, supplement with series of the same genre
        if (seriesList.Count < count && genreList.Any())
        {
            var additionalCount = count - seriesList.Count;
            var existingIds = seriesList.Select(s => s.Id).Append(seriesId).ToArray();
            
            var additional = await connection.QueryAsync<Series>(
                @"SELECT DISTINCT s.id, s.title, s.yearofrelease as YearOfRelease, s.yearofend as YearOfEnd, s.slug, s.description,
                         s.posterurl as PosterUrl, s.trailerurl as TrailerUrl, s.watchurl as WatchUrl,
                         s.totalseasons as TotalSeasons, s.totalepisodes as TotalEpisodes, 
                         s.isongoing as IsOngoing
                  FROM series s
                  INNER JOIN series_genres sg ON sg.seriesid = s.id
                  WHERE s.id != ALL(@ExistingIds)
                    AND sg.name = ANY(@Genres)
                  ORDER BY s.yearofrelease DESC
                  LIMIT @AdditionalCount",
                new { 
                    ExistingIds = existingIds,
                    Genres = genreList.ToArray(),
                    AdditionalCount = additionalCount 
                });
            
            seriesList.AddRange(await EnrichSeriesWithDetailsAsync(connection, additional));
        }
        
        // If still not enough, add any series
        if (seriesList.Count < count)
        {
            var additionalCount = count - seriesList.Count;
            var existingIds = seriesList.Select(s => s.Id).Append(seriesId).ToArray();
            
            var additional = await connection.QueryAsync<Series>(
                @"SELECT id, title, yearofrelease as YearOfRelease, yearofend as YearOfEnd, slug, description,
                         posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl,
                         totalseasons as TotalSeasons, totalepisodes as TotalEpisodes, 
                         isongoing as IsOngoing
                  FROM series
                  WHERE id != ALL(@ExistingIds)
                  ORDER BY yearofrelease DESC
                  LIMIT @AdditionalCount",
                new { 
                    ExistingIds = existingIds,
                    AdditionalCount = additionalCount 
                });
            
            seriesList.AddRange(await EnrichSeriesWithDetailsAsync(connection, additional));
        }
        
        return seriesList.Take(count);
    }
    
    private async Task<IEnumerable<Series>> EnrichSeriesWithDetailsAsync(IDbConnection connection, IEnumerable<Series> series)
    {
        var seriesList = series.ToList();
        
        foreach (var s in seriesList)
        {
            var genres = await connection.QueryAsync<string>(
                "SELECT name FROM series_genres WHERE seriesid = @id", 
                new { id = s.Id });
            s.Genres = genres.ToList();

            var avgRating = await connection.ExecuteScalarAsync<double?>(
                "SELECT AVG(value)::float FROM series_ratings WHERE seriesid = @id",
                new { id = s.Id });
            s.AverageRating = avgRating ?? 0;

            var actorResults = await connection.QueryAsync<dynamic>(
                @"SELECT a.id, a.name
                  FROM actors a 
                  INNER JOIN series_actors sa ON a.id = sa.actorid 
                  WHERE sa.seriesid = @id",
                new { id = s.Id });
            s.Actors = actorResults.Select(r => new Actor
            {
                Id = r.id,
                Name = r.name
            }).ToList();
        }
        
        return seriesList;
    }
    
    private string GetOrderByClause(string? sortBy, string? sortOrder, string? tablePrefix = null)
    {
        var prefix = string.IsNullOrWhiteSpace(tablePrefix) ? "" : $"{tablePrefix}.";
        var order = (sortOrder?.ToLower() == "desc") ? "DESC" : "ASC";
        
        return sortBy?.ToLower() switch
        {
            "year" => $"ORDER BY {prefix}yearofrelease {order}",
            "rating" => $"ORDER BY (SELECT AVG(value)::float FROM series_ratings WHERE seriesid = {prefix}id) {order} NULLS LAST",
            "title" => $"ORDER BY {prefix}title {order}",
            _ => $"ORDER BY {prefix}title ASC"
        };
    }
}