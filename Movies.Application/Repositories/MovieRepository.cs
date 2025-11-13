using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;
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
}