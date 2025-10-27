using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;

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
}