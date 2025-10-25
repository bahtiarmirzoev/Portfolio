using Movies.Application.Models;

namespace Movies.Application.Interfaces;

public interface ICommentRepository
{
    Task<Comment?> CreateCommentAsync(Comment comment, CancellationToken cancellationToken = default);
    Task<Comment?> UpdateCommentAsync(Comment comment, CancellationToken cancellationToken = default);
    Task<bool> DeleteCommentAsync(Guid commentId, CancellationToken cancellationToken = default);
    Task<Comment?> GetCommentByIdAsync(Guid commentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Comment>> GetCommentsByMovieIdAsync(Guid movieId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Comment>> GetCommentsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}