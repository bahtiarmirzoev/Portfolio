
using Movies.Application.Models;

namespace Movies.Application.Interfaces;

public interface ISeriesCommentRepository
{
    Task<SeriesComment?> CreateCommentAsync(SeriesComment comment, CancellationToken cancellationToken = default);
    Task<SeriesComment?> UpdateCommentAsync(SeriesComment comment, CancellationToken cancellationToken = default);
    Task<bool> DeleteCommentAsync(Guid commentId, CancellationToken cancellationToken = default);
    Task<SeriesComment?> GetCommentByIdAsync(Guid commentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<SeriesComment>> GetCommentsBySeriesIdAsync(Guid seriesId, CancellationToken cancellationToken = default);
    Task<IEnumerable<SeriesComment>> GetCommentsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}