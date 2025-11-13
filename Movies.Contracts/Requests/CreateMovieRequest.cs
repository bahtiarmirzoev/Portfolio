namespace Movies.Contracts.Requests;

public class CreateMovieRequest
{
    public required string Title { get; init; }
    
    public required int Year { get; init; }
    
    public string? Description { get; init; } 
    
    public string? PosterUrl { get; init; } 
    
    public string? TrailerUrl { get; init; }
    
    public string? WatchUrl { get; init; } // Ссылка на внешний киносервис для просмотра 
    
    public required IEnumerable<string>  Genres { get; init; } = Enumerable.Empty<string>();
    
    public IEnumerable<string> Actors { get; init; } = Enumerable.Empty<string>();
}