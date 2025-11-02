namespace Movies.Contracts.Responses;

public class SeriesCommentResponse
{
    public Guid Id { get; init; }
    public Guid SeriesId { get; init; }
    public Guid UserId { get; init; }
    public string Content { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}