namespace Movies.Contracts.Requests;

public class CreateMovieRequest
{
    public required string Title { get; init; }
    
    public required int Year { get; init; }
    
    public required IEnumerable<string>  Genres { get; init; } = Enumerable.Empty<string>();
}