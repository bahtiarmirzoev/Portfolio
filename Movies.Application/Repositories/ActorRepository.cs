using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using System.Linq;

namespace Movies.Application.Repositories;

public class ActorRepository : IActorRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ActorRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Actor?> GetByIdAsync(Guid id, CancellationToken token = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<Actor>(
            "SELECT * FROM actors WHERE id = @Id", 
            new { Id = id });
    }

    public async Task<IEnumerable<Actor>> GetByMovieIdAsync(Guid movieId, CancellationToken token = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        const string sql = """
            SELECT a.*, ma.character_name, ma."order"
            FROM actors a
            INNER JOIN movie_actors ma ON a.id = ma.actorid
            WHERE ma.movieid = @MovieId
            ORDER BY ma."order"
        """;
        
        return await connection.QueryAsync<Actor>(sql, new { MovieId = movieId });
    }

    public async Task<IEnumerable<Actor>> GetAllAsync(CancellationToken token = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        return await connection.QueryAsync<Actor>("SELECT * FROM actors ORDER BY name");
    }

    public async Task<IEnumerable<Actor>> GetAllAsync(string? sortBy, string? sortOrder, CancellationToken token = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        var orderBy = sortBy?.ToLower() switch
        {
            "name" => "name",
            "dateofbirth" => "dateofbirth",
            _ => "name"
        };
        
        var order = sortOrder?.ToLower() == "desc" ? "DESC" : "ASC";
        
        var sql = $"SELECT * FROM actors ORDER BY {orderBy} {order}";
        return await connection.QueryAsync<Actor>(sql);
    }

    public async Task<bool> CreateAsync(Actor actor, CancellationToken token = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.ExecuteAsync(
            "INSERT INTO actors (id, name, dateofbirth, biography) VALUES (@Id, @Name, @DateOfBirth, @Biography)",
            actor);
        return result > 0;
    }

    public async Task<bool> UpdateAsync(Actor actor, CancellationToken token = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.ExecuteAsync(
            "UPDATE actors SET name = @Name, dateofbirth = @DateOfBirth, biography = @Biography WHERE id = @Id",
            actor);
        return result > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken token = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.ExecuteAsync(
            "DELETE FROM actors WHERE id = @Id",
            new { Id = id });
        return result > 0;
    }

    public async Task<bool> AddActorToMovieAsync(Guid movieId, Guid actorId, string? characterName = null, int order = 0, CancellationToken token = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.ExecuteAsync(
            "INSERT INTO movie_actors (movieid, actorid, character_name, \"order\") VALUES (@MovieId, @ActorId, @CharacterName, @Order)",
            new { MovieId = movieId, ActorId = actorId, CharacterName = characterName, Order = order });
        return result > 0;
    }

    public async Task<bool> RemoveActorFromMovieAsync(Guid movieId, Guid actorId, CancellationToken token = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.ExecuteAsync(
            "DELETE FROM movie_actors WHERE movieid = @MovieId AND actorid = @ActorId",
            new { MovieId = movieId, ActorId = actorId });
        return result > 0;
    }

    public async Task<IEnumerable<Movie>> GetMoviesByActorIdAsync(Guid actorId, CancellationToken token = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        const string sql = """
            SELECT DISTINCT m.id, m.title, m.yearofrelease as YearOfRelease, 
                   m.description, m.posterurl as PosterUrl, m.trailerurl as TrailerUrl, m.slug
            FROM movies m
            INNER JOIN movie_actors ma ON m.id = ma.movieid
            WHERE ma.actorid = @ActorId
            ORDER BY m.yearofrelease DESC
        """;
        
        var movies = await connection.QueryAsync<Movie>(sql, new { ActorId = actorId });
        
        // Загружаем дополнительные данные для каждого фильма
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
        }
        
        return movies;
    }

    public async Task<IEnumerable<Series>> GetSeriesByActorIdAsync(Guid actorId, CancellationToken token = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        const string sql = """
            SELECT DISTINCT s.id, s.title, s.yearofrelease as YearOfRelease, s.yearofend as YearOfEnd,
                   s.description, s.posterurl as PosterUrl, s.trailerurl as TrailerUrl,
                   s.totalseasons as TotalSeasons, s.totalepisodes as TotalEpisodes, s.isongoing as IsOngoing, s.slug
            FROM series s
            INNER JOIN series_actors sa ON s.id = sa.seriesid
            WHERE sa.actorid = @ActorId
            ORDER BY s.yearofrelease DESC
        """;
        
        var series = await connection.QueryAsync<Series>(sql, new { ActorId = actorId });
        
        // Загружаем дополнительные данные для каждого сериала
        foreach (var item in series)
        {
            var genres = await connection.QueryAsync<string>(
                "SELECT name FROM series_genres WHERE seriesid = @id", 
                new { id = item.Id });
            item.Genres = genres.ToList();

            var avgRating = await connection.ExecuteScalarAsync<double?>(@"
                SELECT AVG(value)::float FROM series_ratings WHERE seriesid = @id
            ", new { id = item.Id });
            item.AverageRating = avgRating ?? 0;
        }
        
        return series;
    }
}