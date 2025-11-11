namespace Movies.Application.Models;

public class FavoriteSeries
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }  // Кто добавил
    public Guid SeriesId { get; set; } // Какой сериал
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

