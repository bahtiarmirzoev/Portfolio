using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using System.Data;
using System.Linq;

namespace Movies.Application.Repositories;

public class MovieRepository : IMovieRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public MovieRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<bool> CreateMovieAsync(Movie movie)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        // 🆕 Добавляем PosterUrl, TrailerUrl и WatchUrl в INSERT
        var result = await connection.ExecuteAsync("""
            INSERT INTO movies (id, slug, title, yearofrelease, description, posterurl, trailerurl, watchurl)
            VALUES (@Id, @Slug, @Title, @YearOfRelease, @Description, @PosterUrl, @TrailerUrl, @WatchUrl)
        """, movie, transaction);

        if (result > 0 && movie.Genres.Any())
        {
            foreach (var genre in movie.Genres)
            {
                await connection.ExecuteAsync("""
                    INSERT INTO genres (movieid, name)
                    VALUES (@MovieId, @Name)
                """, new { MovieId = movie.Id, Name = genre }, transaction);
            }
        }

        if (result > 0 && movie.Actors.Any())
        {
            foreach (var actor in movie.Actors)
            {
                // Проверяем существование актера по имени (case-insensitive)
                // Используем ORDER BY id LIMIT 1 чтобы гарантировать один результат даже при дубликатах
                var existingActorId = await connection.QueryFirstOrDefaultAsync<Guid?>(
                    "SELECT id FROM actors WHERE LOWER(TRIM(name)) = LOWER(TRIM(@Name)) ORDER BY id LIMIT 1", 
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
                    "SELECT COUNT(1) FROM movie_actors WHERE movieid = @MovieId AND actorid = @ActorId",
                    new { MovieId = movie.Id, ActorId = actorIdToUse }, transaction);

                if (!linkExists)
                {
                    await connection.ExecuteAsync("""
                        INSERT INTO movie_actors (movieid, actorid)
                        VALUES (@MovieId, @ActorId)
                    """, new { 
                        MovieId = movie.Id, 
                        ActorId = actorIdToUse
                    }, transaction);
                }
            }
        }

        transaction.Commit();
        return result > 0;
    }

    public async Task<Movie?> GetByIdAsync(Guid id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        // 🆕 Добавляем PosterUrl, TrailerUrl и WatchUrl в SELECT
        var movie = await connection.QuerySingleOrDefaultAsync<Movie>(
            "SELECT id, title, yearofrelease as YearOfRelease, slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl FROM movies WHERE id=@id", 
            new { id });
        
        if (movie == null) return null;

        var genres = await connection.QueryAsync<string>("SELECT name FROM genres WHERE movieid=@id", new { id });
        movie.Genres = genres.ToList();

        var avgRating = await connection.ExecuteScalarAsync<double?>(@"
            SELECT AVG(value)::float FROM ratings WHERE movieid=@id
        ", new { id });
        movie.AverageRating = avgRating ?? 0;

        var actorResults = await connection.QueryAsync<dynamic>(@"
            SELECT a.id, a.name
            FROM actors a 
            INNER JOIN movie_actors ma ON a.id = ma.actorid 
            WHERE ma.movieid = @id
        ", new { id });
        movie.Actors = actorResults.Select(r => new Actor
        {
            Id = r.id,
            Name = r.name
        }).ToList();

        return movie;
    }

    public async Task<Movie?> GetBySlugAsync(string slug)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        // 🆕 Добавляем PosterUrl, TrailerUrl и WatchUrl в SELECT
        var movie = await connection.QuerySingleOrDefaultAsync<Movie>(
            "SELECT id, title, yearofrelease as YearOfRelease, slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl FROM movies WHERE slug=@slug", 
            new { slug });
        
        if (movie == null) return null;

        var genres = await connection.QueryAsync<string>("SELECT name FROM genres WHERE movieid=@id", new { id = movie.Id });
        movie.Genres = genres.ToList();

        var avgRating = await connection.ExecuteScalarAsync<double?>(@"
            SELECT AVG(value)::float FROM ratings WHERE movieid=@id
        ", new { id = movie.Id });
        movie.AverageRating = avgRating ?? 0;

        var actorResults = await connection.QueryAsync<dynamic>(@"
            SELECT a.id, a.name
            FROM actors a 
            INNER JOIN movie_actors ma ON a.id = ma.actorid 
            WHERE ma.movieid = @id
        ", new { id = movie.Id });
        movie.Actors = actorResults.Select(r => new Actor
        {
            Id = r.id,
            Name = r.name
        }).ToList();

        return movie;
    }

    public async Task<IEnumerable<Movie>> GetAllAsync()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        // 🆕 Добавляем PosterUrl, TrailerUrl и WatchUrl в SELECT
        var movies = await connection.QueryAsync<Movie>(
            "SELECT id, title, yearofrelease as YearOfRelease, slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl FROM movies");

        foreach (var movie in movies)
        {
            var genres = await connection.QueryAsync<string>("SELECT name FROM genres WHERE movieid=@id", new { id = movie.Id });
            movie.Genres = genres.ToList();

            var avgRating = await connection.ExecuteScalarAsync<double?>(@"
                SELECT AVG(value)::float FROM ratings WHERE movieid=@id
            ", new { id = movie.Id });
            movie.AverageRating = avgRating ?? 0;

            var actorResults = await connection.QueryAsync<dynamic>(@"
                SELECT a.id, a.name
                FROM actors a 
                INNER JOIN movie_actors ma ON a.id = ma.actorid 
                WHERE ma.movieid = @id
            ", new { id = movie.Id });
            movie.Actors = actorResults.Select(r => new Actor
            {
                Id = r.id,
                Name = r.name
            }).ToList();
        }

        return movies;
    }

    public async Task<bool> UpdateMovieAsync(Movie movie)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        await connection.ExecuteAsync("DELETE FROM genres WHERE movieid=@id", new { id = movie.Id }, transaction);
        await connection.ExecuteAsync("DELETE FROM movie_actors WHERE movieid=@id", new { id = movie.Id }, transaction);

        foreach (var genre in movie.Genres)
        {
            await connection.ExecuteAsync("INSERT INTO genres (movieid, name) VALUES (@MovieId, @Name)",
                new { MovieId = movie.Id, Name = genre }, transaction);
        }

        foreach (var actor in movie.Actors)
        {
            // Проверяем существование актера по имени (case-insensitive)
            // Используем ORDER BY id LIMIT 1 чтобы гарантировать один результат даже при дубликатах
            var existingActorId = await connection.QueryFirstOrDefaultAsync<Guid?>(
                "SELECT id FROM actors WHERE LOWER(TRIM(name)) = LOWER(TRIM(@Name)) ORDER BY id LIMIT 1", 
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
                "SELECT COUNT(1) FROM movie_actors WHERE movieid = @MovieId AND actorid = @ActorId",
                new { MovieId = movie.Id, ActorId = actorIdToUse }, transaction);

            if (!linkExists)
            {
                await connection.ExecuteAsync("""
                    INSERT INTO movie_actors (movieid, actorid)
                    VALUES (@MovieId, @ActorId)
                """, new { 
                    MovieId = movie.Id, 
                    ActorId = actorIdToUse
                }, transaction);
            }
        }

        // 🆕 Добавляем PosterUrl, TrailerUrl и WatchUrl в UPDATE
        var result = await connection.ExecuteAsync("""
            UPDATE movies
            SET slug=@Slug, title=@Title, yearofrelease=@YearOfRelease, 
                description=@Description, posterurl=@PosterUrl, trailerurl=@TrailerUrl, watchurl=@WatchUrl
            WHERE id=@Id
        """, movie, transaction);

        transaction.Commit();
        return result > 0;
    }

    public async Task<bool> DeleteMovieByIdAsync(Guid id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        await connection.ExecuteAsync("DELETE FROM genres WHERE movieid=@id", new { id }, transaction);
        await connection.ExecuteAsync("DELETE FROM movie_actors WHERE movieid=@id", new { id }, transaction);
        var result = await connection.ExecuteAsync("DELETE FROM movies WHERE id=@id", new { id }, transaction);

        transaction.Commit();
        return result > 0;
    }

    public async Task<bool> ExistsByIdAsync(Guid id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var count = await connection.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM movies WHERE id=@id", new { id });
        return count > 0;
    }

    public async Task<(IEnumerable<Movie> movies, int totalCount)> GetAllAsync(int skip, int take)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var totalCount = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM movies");

        // 🆕 Добавляем PosterUrl, TrailerUrl и WatchUrl в SELECT
        var movies = await connection.QueryAsync<Movie>(
            "SELECT id, title, yearofrelease as YearOfRelease, slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl FROM movies ORDER BY title LIMIT @Take OFFSET @Skip",
            new { Take = take, Skip = skip });

        foreach (var movie in movies)
        {
            var genres = await connection.QueryAsync<string>("SELECT name FROM genres WHERE movieid=@id", new { id = movie.Id });
            movie.Genres = genres.ToList();

            var avgRating = await connection.ExecuteScalarAsync<double?>(@"
                SELECT AVG(value)::float FROM ratings WHERE movieid=@id
            ", new { id = movie.Id });
            movie.AverageRating = avgRating ?? 0;

            var actorResults = await connection.QueryAsync<dynamic>(@"
                SELECT a.id, a.name
                FROM actors a 
                INNER JOIN movie_actors ma ON a.id = ma.actorid 
                WHERE ma.movieid = @id
            ", new { id = movie.Id });
            movie.Actors = actorResults.Select(r => new Actor
            {
                Id = r.id,
                Name = r.name
            }).ToList();
        }

        return (movies, totalCount);
    }

    public async Task<(IEnumerable<Movie> movies, int totalCount)> SearchAsync(string search, int skip, int take)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var totalCount = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM movies WHERE title ILIKE @Search",
            new { Search = $"%{search}%" });

        // 🆕 Добавляем PosterUrl, TrailerUrl и WatchUrl в SELECT
        var movies = await connection.QueryAsync<Movie>(
            "SELECT id, title, yearofrelease as YearOfRelease, slug, description, posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl FROM movies WHERE title ILIKE @Search ORDER BY title LIMIT @Take OFFSET @Skip",
            new { Search = $"%{search}%", Take = take, Skip = skip });

        foreach (var movie in movies)
        {
            var genres = await connection.QueryAsync<string>("SELECT name FROM genres WHERE movieid=@id", new { id = movie.Id });
            movie.Genres = genres.ToList();

            var avgRating = await connection.ExecuteScalarAsync<double?>(@"
                SELECT AVG(value)::float FROM ratings WHERE movieid=@id
            ", new { id = movie.Id });
            movie.AverageRating = avgRating ?? 0;

            var actorResults = await connection.QueryAsync<dynamic>(@"
                SELECT a.id, a.name
                FROM actors a 
                INNER JOIN movie_actors ma ON a.id = ma.actorid 
                WHERE ma.movieid = @id
            ", new { id = movie.Id });
            movie.Actors = actorResults.Select(r => new Actor
            {
                Id = r.id,
                Name = r.name
            }).ToList();
        }

        return (movies, totalCount);
    }
    
    public async Task<(IEnumerable<Movie> movies, int totalCount)> FilterAsync(
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
            whereConditions.Add("EXISTS (SELECT 1 FROM genres g WHERE g.movieid = m.id AND g.name = @Genre)");
            parameters.Add("Genre", genre);
        }

        if (yearFrom.HasValue)
        {
            whereConditions.Add("m.yearofrelease >= @YearFrom");
            parameters.Add("YearFrom", yearFrom.Value);
        }

        if (yearTo.HasValue)
        {
            whereConditions.Add("m.yearofrelease <= @YearTo");
            parameters.Add("YearTo", yearTo.Value);
        }

        if (!string.IsNullOrWhiteSpace(actor))
        {
            whereConditions.Add(@"EXISTS (
                SELECT 1 FROM movie_actors ma 
                INNER JOIN actors a ON ma.actorid = a.id 
                WHERE ma.movieid = m.id AND a.name ILIKE @Actor
            )");
            parameters.Add("Actor", $"%{actor}%");
        }

        var whereClause = whereConditions.Any() 
            ? "WHERE " + string.Join(" AND ", whereConditions)
            : string.Empty;

        var countSql = $@"SELECT COUNT(*) FROM movies m {whereClause}";
        var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

        parameters.Add("Take", take);
        parameters.Add("Skip", skip);

        // 🆕 Добавляем PosterUrl и TrailerUrl в SELECT
        var moviesSql = $@"
            SELECT m.id, m.title, m.yearofrelease as YearOfRelease, m.slug, m.description, m.posterurl as PosterUrl, m.trailerurl as TrailerUrl, m.watchurl as WatchUrl 
            FROM movies m 
            {whereClause}
            ORDER BY m.title 
            LIMIT @Take OFFSET @Skip";

        var movies = await connection.QueryAsync<Movie>(moviesSql, parameters);

        foreach (var movie in movies)
        {
            var genres = await connection.QueryAsync<string>(
                "SELECT name FROM genres WHERE movieid = @id", 
                new { id = movie.Id });
            movie.Genres = genres.ToList();

            var avgRating = await connection.ExecuteScalarAsync<double?>(@"
                SELECT AVG(value)::float FROM ratings WHERE movieid = @id
            ", new { id = movie.Id });
            movie.AverageRating = avgRating ?? 0;

            var actorResults = await connection.QueryAsync<dynamic>(@"
                SELECT a.id, a.name
                FROM actors a 
                INNER JOIN movie_actors ma ON a.id = ma.actorid 
                WHERE ma.movieid = @id
            ", new { id = movie.Id });
            movie.Actors = actorResults.Select(r => new Actor
            {
                Id = r.id,
                Name = r.name
            }).ToList();
        }

        return (movies, totalCount);
    }
    
    public async Task<IEnumerable<Movie>> GetSimilarMoviesAsync(Guid movieId, int count = 5)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        // Получаем информацию о текущем фильме
        var currentMovie = await GetByIdAsync(movieId);
        if (currentMovie == null)
        {
            return Enumerable.Empty<Movie>();
        }
        
        // Получаем жанры текущего фильма
        var genres = await connection.QueryAsync<string>(
            "SELECT name FROM genres WHERE movieid = @MovieId",
            new { MovieId = movieId });
        var genreList = genres.ToList();
        
        // Получаем актеров текущего фильма
        var actors = await connection.QueryAsync<Guid>(
            @"SELECT actorid FROM movie_actors WHERE movieid = @MovieId",
            new { MovieId = movieId });
        var actorIds = actors.ToList();
        
        var yearOfRelease = currentMovie.YearOfRelease;
        
        // Если нет жанров и актеров, возвращаем просто фильмы того же года или близкие
        if (!genreList.Any() && !actorIds.Any())
        {
            var similar = await connection.QueryAsync<Movie>(
                @"SELECT id, title, yearofrelease as YearOfRelease, slug, description, 
                         posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl
                  FROM movies 
                  WHERE id != @MovieId 
                    AND yearofrelease BETWEEN @YearFrom AND @YearTo
                  ORDER BY ABS(yearofrelease - @YearOfRelease)
                  LIMIT @Count",
                new { 
                    MovieId = movieId, 
                    YearOfRelease = yearOfRelease,
                    YearFrom = yearOfRelease - 5,
                    YearTo = yearOfRelease + 5,
                    Count = count 
                });
            
            return await EnrichMoviesWithDetailsAsync(connection, similar);
        }
        
        // Строим SQL запрос с подсчетом релевантности
        var sql = @"
            WITH movie_scores AS (
                SELECT 
                    m.id,
                    m.title,
                    m.yearofrelease as YearOfRelease,
                    m.slug,
                    m.description,
                    m.posterurl as PosterUrl,
                    m.trailerurl as TrailerUrl,
                    m.watchurl as WatchUrl,
                    -- Подсчет совпадений по жанрам (вес: 3 балла за каждый жанр)
                    COALESCE((
                        SELECT COUNT(*) * 3
                        FROM genres g
                        WHERE g.movieid = m.id 
                          AND (@GenresCount = 0 OR g.name = ANY(@Genres))
                    ), 0) as genre_score,
                    -- Подсчет совпадений по актерам (вес: 2 балла за каждого актера)
                    COALESCE((
                        SELECT COUNT(*) * 2
                        FROM movie_actors ma
                        WHERE ma.movieid = m.id 
                          AND (@ActorIdsCount = 0 OR ma.actorid = ANY(@ActorIds))
                    ), 0) as actor_score,
                    -- Бонус за близкий год выпуска (вес: 1 балл за каждый год близости, максимум 5)
                    GREATEST(0, 5 - ABS(m.yearofrelease - @YearOfRelease)) as year_score
                FROM movies m
                WHERE m.id != @MovieId
            )
            SELECT 
                id,
                title,
                YearOfRelease,
                slug,
                description,
                PosterUrl,
                TrailerUrl,
                WatchUrl,
                (genre_score + actor_score + year_score) as relevance_score
            FROM movie_scores
            WHERE (genre_score + actor_score + year_score) > 0
            ORDER BY relevance_score DESC, title
            LIMIT @Count";
        
        var parameters = new DynamicParameters();
        parameters.Add("MovieId", movieId);
        parameters.Add("Genres", genreList.Any() ? genreList.ToArray() : new string[0]);
        parameters.Add("GenresCount", genreList.Count);
        parameters.Add("ActorIds", actorIds.Any() ? actorIds.ToArray() : new Guid[0]);
        parameters.Add("ActorIdsCount", actorIds.Count);
        parameters.Add("YearOfRelease", yearOfRelease);
        parameters.Add("Count", count);
        
        var similarMovies = await connection.QueryAsync<Movie>(sql, parameters);
        var moviesList = similarMovies.ToList();
        
        // Если не нашли достаточно фильмов по релевантности, дополняем фильмами того же жанра
        if (moviesList.Count < count && genreList.Any())
        {
            var additionalCount = count - moviesList.Count;
            var existingIds = moviesList.Select(m => m.Id).Append(movieId).ToArray();
            
            var additional = await connection.QueryAsync<Movie>(
                @"SELECT DISTINCT m.id, m.title, m.yearofrelease as YearOfRelease, m.slug, m.description,
                         m.posterurl as PosterUrl, m.trailerurl as TrailerUrl, m.watchurl as WatchUrl
                  FROM movies m
                  INNER JOIN genres g ON g.movieid = m.id
                  WHERE m.id != ALL(@ExistingIds)
                    AND g.name = ANY(@Genres)
                  ORDER BY m.yearofrelease DESC
                  LIMIT @AdditionalCount",
                new { 
                    ExistingIds = existingIds,
                    Genres = genreList.ToArray(),
                    AdditionalCount = additionalCount 
                });
            
            moviesList.AddRange(await EnrichMoviesWithDetailsAsync(connection, additional));
        }
        
        // Если все еще не хватает, добавляем любые фильмы
        if (moviesList.Count < count)
        {
            var additionalCount = count - moviesList.Count;
            var existingIds = moviesList.Select(m => m.Id).Append(movieId).ToArray();
            
            var additional = await connection.QueryAsync<Movie>(
                @"SELECT id, title, yearofrelease as YearOfRelease, slug, description,
                         posterurl as PosterUrl, trailerurl as TrailerUrl, watchurl as WatchUrl
                  FROM movies
                  WHERE id != ALL(@ExistingIds)
                  ORDER BY yearofrelease DESC
                  LIMIT @AdditionalCount",
                new { 
                    ExistingIds = existingIds,
                    AdditionalCount = additionalCount 
                });
            
            moviesList.AddRange(await EnrichMoviesWithDetailsAsync(connection, additional));
        }
        
        return moviesList.Take(count);
    }
    
    private async Task<IEnumerable<Movie>> EnrichMoviesWithDetailsAsync(IDbConnection connection, IEnumerable<Movie> movies)
    {
        var moviesList = movies.ToList();
        
        foreach (var movie in moviesList)
        {
            var genres = await connection.QueryAsync<string>(
                "SELECT name FROM genres WHERE movieid = @id", 
                new { id = movie.Id });
            movie.Genres = genres.ToList();

            var avgRating = await connection.ExecuteScalarAsync<double?>(
                "SELECT AVG(value)::float FROM ratings WHERE movieid = @id",
                new { id = movie.Id });
            movie.AverageRating = avgRating ?? 0;

            var actorResults = await connection.QueryAsync<dynamic>(
                @"SELECT a.id, a.name
                  FROM actors a 
                  INNER JOIN movie_actors ma ON a.id = ma.actorid 
                  WHERE ma.movieid = @id",
                new { id = movie.Id });
            movie.Actors = actorResults.Select(r => new Actor
            {
                Id = r.id,
                Name = r.name
            }).ToList();
        }
        
        return moviesList;
    }
}