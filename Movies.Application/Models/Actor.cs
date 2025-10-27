namespace Movies.Application.Models;

public class Actor
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
  
    public DateOnly? DateOfBirth { get; set; } // ← оставь для базы
    public string? Biography { get; set; } // ← оставь для базы
}
