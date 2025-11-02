using Movies.Application.Models;

namespace Movies.Application.Interfaces;

public interface ISeriesCommentService
{
    Task<SeriesComment?> CreateCommentAsync(Guid seriesId, Guid userId, string content, CancellationToken cancellationToken = default);
    Task<SeriesComment?> UpdateCommentAsync(Guid commentId, Guid userId, string content, CancellationToken cancellationToken = default);
    Task<bool> DeleteCommentAsync(Guid commentId, Guid userId, CancellationToken cancellationToken = default);
    Task<SeriesComment?> GetCommentByIdAsync(Guid commentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<SeriesComment>> GetCommentsBySeriesIdAsync(Guid seriesId, CancellationToken cancellationToken = default);
    Task<IEnumerable<SeriesComment>> GetCommentsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}