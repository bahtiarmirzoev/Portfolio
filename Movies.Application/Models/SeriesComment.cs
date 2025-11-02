namespace Movies.Application.Models;

public class SeriesComment
{
    public Guid Id { get; set; }
    public Guid SeriesId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}