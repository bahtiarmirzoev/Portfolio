using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;

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

        var result = await connection.ExecuteAsync("""
                                                       INSERT INTO movies (id, slug, title, yearofrelease)
                                                       VALUES (@Id, @Slug, @Title, @YearOfRelease)
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

        // Добавляем актеров, если они есть
        if (result > 0 && movie.Actors.Any())
        {
            foreach (var actor in movie.Actors)
            {
                // Сначала создаем актера если его нет
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

                // Потом создаем связь
                await connection.ExecuteAsync("""
                                                  INSERT INTO movie_actors (movieid, actorid)
                                                  VALUES (@MovieId, @ActorId)
                                              """, new { 
                    MovieId = movie.Id, 
                    ActorId = actor.Id
                }, transaction);
            }
        }

        transaction.Commit();
        return result > 0;
    }

    public async Task<Movie?> GetByIdAsync(Guid id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var movie = await connection.QuerySingleOrDefaultAsync<Movie>(
            "SELECT id, title, yearofrelease as YearOfRelease, slug FROM movies WHERE id=@id", 
            new { id });
        
        if (movie == null) return null;

        // Загрузка жанров
        var genres = await connection.QueryAsync<string>("SELECT name FROM genres WHERE movieid=@id", new { id });
        movie.Genres = genres.ToList();

        // Загрузка рейтинга
        var avgRating = await connection.ExecuteScalarAsync<double?>(@"
            SELECT AVG(value)::float FROM ratings WHERE movieid=@id
        ", new { id });
        movie.AverageRating = avgRating ?? 0;

        // Загрузка актеров
        var actors = await connection.QueryAsync<Actor>(@"
            SELECT a.*
            FROM actors a 
            INNER JOIN movie_actors ma ON a.id = ma.actorid 
            WHERE ma.movieid = @id
        ", new { id });
        movie.Actors = actors.ToList();

        return movie;
    }

    public async Task<Movie?> GetBySlugAsync(string slug)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var movie = await connection.QuerySingleOrDefaultAsync<Movie>(
            "SELECT id, title, yearofrelease as YearOfRelease, slug FROM movies WHERE slug=@slug", 
            new { slug });
        
        if (movie == null) return null;

        // Загрузка жанров
        var genres = await connection.QueryAsync<string>("SELECT name FROM genres WHERE movieid=@id", new { id = movie.Id });
        movie.Genres = genres.ToList();

        // Загрузка рейтинга
        var avgRating = await connection.ExecuteScalarAsync<double?>(@"
            SELECT AVG(value)::float FROM ratings WHERE movieid=@id
        ", new { id = movie.Id });
        movie.AverageRating = avgRating ?? 0;

        // Загрузка актеров
        var actors = await connection.QueryAsync<Actor>(@"
            SELECT a.*
            FROM actors a 
            INNER JOIN movie_actors ma ON a.id = ma.actorid 
            WHERE ma.movieid = @id
        ", new { id = movie.Id });
        movie.Actors = actors.ToList();

        return movie;
    }

    public async Task<IEnumerable<Movie>> GetAllAsync()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var movies = await connection.QueryAsync<Movie>(
            "SELECT id, title, yearofrelease as YearOfRelease, slug FROM movies");

        foreach (var movie in movies)
        {
            // Загрузка жанров
            var genres = await connection.QueryAsync<string>("SELECT name FROM genres WHERE movieid=@id", new { id = movie.Id });
            movie.Genres = genres.ToList();

            // Загрузка рейтинга
            var avgRating = await connection.ExecuteScalarAsync<double?>(@"
                SELECT AVG(value)::float FROM ratings WHERE movieid=@id
            ", new { id = movie.Id });
            movie.AverageRating = avgRating ?? 0;

            // Загрузка актеров
            var actors = await connection.QueryAsync<Actor>(@"
                SELECT a.*
                FROM actors a 
                INNER JOIN movie_actors ma ON a.id = ma.actorid 
                WHERE ma.movieid = @id
            ", new { id = movie.Id });
            movie.Actors = actors.ToList();
        }

        return movies;
    }

    public async Task<bool> UpdateMovieAsync(Movie movie)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        // Удаляем старые жанры
        await connection.ExecuteAsync("DELETE FROM genres WHERE movieid=@id", new { id = movie.Id }, transaction);

        // Удаляем старых актеров
        await connection.ExecuteAsync("DELETE FROM movie_actors WHERE movieid=@id", new { id = movie.Id }, transaction);

        // Добавляем новые жанры
        foreach (var genre in movie.Genres)
        {
            await connection.ExecuteAsync("INSERT INTO genres (movieid, name) VALUES (@MovieId, @Name)",
                new { MovieId = movie.Id, Name = genre }, transaction);
        }

        // Добавляем новых актеров
        foreach (var actor in movie.Actors)
        {
            await connection.ExecuteAsync("""
                INSERT INTO movie_actors (movieid, actorid)
                VALUES (@MovieId, @ActorId)
            """, new { 
                MovieId = movie.Id, 
                ActorId = actor.Id
            }, transaction);
        }

        // Обновляем фильм
        var result = await connection.ExecuteAsync("""
            UPDATE movies
            SET slug=@Slug, title=@Title, yearofrelease=@YearOfRelease
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
}