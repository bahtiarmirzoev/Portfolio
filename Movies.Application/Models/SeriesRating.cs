namespace Movies.Application.Models;

public class SeriesRating
{
    public Guid Id { get; set; }        
    public Guid UserId { get; set; }      
    public Guid SeriesId { get; set; }     
    public int Value { get; set; }        
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}