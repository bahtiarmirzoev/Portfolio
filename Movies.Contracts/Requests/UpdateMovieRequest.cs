namespace Movies.Contracts.Requests;

public class UpdateMovieRequest
{
    public required string Title { get; init; }
    
    public required int Year { get; init; }
    
    public string? Description { get; init; } 
    
    public required IEnumerable<string>  Genres { get; init; } = Enumerable.Empty<string>();
    
    public IEnumerable<string> Actors { get; init; } = Enumerable.Empty<string>();
}