using Movies.Application.Models;

namespace Movies.Application.Interfaces;

public interface ICommentService
{
    Task<Comment?> CreateCommentAsync(Guid movieId, Guid userId, string content, CancellationToken cancellationToken = default);
    Task<Comment?> UpdateCommentAsync(Guid commentId, Guid userId, string content, CancellationToken cancellationToken = default);
    Task<bool> DeleteCommentAsync(Guid commentId, Guid userId, CancellationToken cancellationToken = default);
    Task<Comment?> GetCommentByIdAsync(Guid commentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Comment>> GetCommentsByMovieIdAsync(Guid movieId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Comment>> GetCommentsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}