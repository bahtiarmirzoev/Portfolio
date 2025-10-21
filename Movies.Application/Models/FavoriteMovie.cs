public class FavoriteMovie
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }  // Кто добавил
    public Guid MovieId { get; set; } // Какой фильм
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}