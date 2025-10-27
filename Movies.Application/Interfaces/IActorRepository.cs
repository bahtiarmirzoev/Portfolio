using Movies.Application.Models;

namespace Movies.Application.Interfaces;

public interface IActorRepository
{
    Task<Actor?> GetByIdAsync(Guid id, CancellationToken token = default);
    Task<IEnumerable<Actor>> GetByMovieIdAsync(Guid movieId, CancellationToken token = default);
    Task<IEnumerable<Actor>> GetAllAsync(CancellationToken token = default); // ← ДОБАВЬ ЭТОТ МЕТОД
    Task<bool> CreateAsync(Actor actor, CancellationToken token = default);
    Task<bool> UpdateAsync(Actor actor, CancellationToken token = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken token = default);
    Task<bool> AddActorToMovieAsync(Guid movieId, Guid actorId, string? characterName = null, int order = 0, CancellationToken token = default);
    Task<bool> RemoveActorFromMovieAsync(Guid movieId, Guid actorId, CancellationToken token = default);
}