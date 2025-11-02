// Movies.Application/Services/SeriesCommentService.cs
using Movies.Application.Interfaces;
using Movies.Application.Models;

namespace Movies.Application.Services;

public class SeriesCommentService : ISeriesCommentService
{
    private readonly ISeriesCommentRepository _commentRepository;

    public SeriesCommentService(ISeriesCommentRepository commentRepository)
    {
        _commentRepository = commentRepository;
    }

    public async Task<SeriesComment?> CreateCommentAsync(Guid seriesId, Guid userId, string content, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(content))
            return null;

        var comment = new SeriesComment
        {
            Id = Guid.NewGuid(),
            SeriesId = seriesId,
            UserId = userId,
            Content = content.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return await _commentRepository.CreateCommentAsync(comment, cancellationToken);
    }

    public async Task<SeriesComment?> UpdateCommentAsync(Guid commentId, Guid userId, string content, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(content))
            return null;

        // Check if comment exists and belongs to user
        var existingComment = await _commentRepository.GetCommentByIdAsync(commentId, cancellationToken);
        if (existingComment == null || existingComment.UserId != userId)
            return null;

        var comment = new SeriesComment
        {
            Id = commentId,
            UserId = userId,
            Content = content.Trim(),
            UpdatedAt = DateTime.UtcNow
        };

        return await _commentRepository.UpdateCommentAsync(comment, cancellationToken);
    }

    public async Task<bool> DeleteCommentAsync(Guid commentId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Check if comment exists and belongs to user
        var existingComment = await _commentRepository.GetCommentByIdAsync(commentId, cancellationToken);
        if (existingComment == null || existingComment.UserId != userId)
            return false;

        return await _commentRepository.DeleteCommentAsync(commentId, cancellationToken);
    }

    public async Task<SeriesComment?> GetCommentByIdAsync(Guid commentId, CancellationToken cancellationToken = default)
    {
        return await _commentRepository.GetCommentByIdAsync(commentId, cancellationToken);
    }

    public async Task<IEnumerable<SeriesComment>> GetCommentsBySeriesIdAsync(Guid seriesId, CancellationToken cancellationToken = default)
    {
        return await _commentRepository.GetCommentsBySeriesIdAsync(seriesId, cancellationToken);
    }

    public async Task<IEnumerable<SeriesComment>> GetCommentsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _commentRepository.GetCommentsByUserIdAsync(userId, cancellationToken);
    }
}