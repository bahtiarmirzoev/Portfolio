namespace Movies.Application.Models;

public class MovieActor
{
    public int Id { get; set; }
    public Guid MovieId { get; set; }
    public Guid ActorId { get; set; }
    public string? CharacterName { get; set; }
    public int Order { get; set; }
    
    // Navigation properties
    public Actor? Actor { get; set; }
    public Movie? Movie { get; set; }
}