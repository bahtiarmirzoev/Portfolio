using Movies.Application.Interfaces;
using Movies.Application.Models;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Movies.Application.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;

        public CommentService(ICommentRepository commentRepository)
        {
            _commentRepository = commentRepository;
        }

        public async Task<Comment?> CreateCommentAsync(Guid movieId, Guid userId, string content, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(content))
                return null;

            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                MovieId = movieId,
                UserId = userId,
                Content = content.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            return await _commentRepository.CreateCommentAsync(comment, cancellationToken);
        }

        public async Task<Comment?> UpdateCommentAsync(Guid commentId, Guid userId, string content, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(content))
                return null;

            // Check if comment exists and belongs to user
            var existingComment = await _commentRepository.GetCommentByIdAsync(commentId, cancellationToken);
            if (existingComment == null || existingComment.UserId != userId)
                return null;

            var comment = new Comment
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

        public async Task<Comment?> GetCommentByIdAsync(Guid commentId, CancellationToken cancellationToken = default)
        {
            return await _commentRepository.GetCommentByIdAsync(commentId, cancellationToken);
        }

        public async Task<IEnumerable<Comment>> GetCommentsByMovieIdAsync(Guid movieId, CancellationToken cancellationToken = default)
        {
            return await _commentRepository.GetCommentsByMovieIdAsync(movieId, cancellationToken);
        }

        public async Task<IEnumerable<Comment>> GetCommentsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _commentRepository.GetCommentsByUserIdAsync(userId, cancellationToken);
        }
    }
}