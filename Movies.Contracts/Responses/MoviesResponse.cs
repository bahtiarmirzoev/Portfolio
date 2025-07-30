namespace Movies.Contracts.Responses;

public class MoviesResponse
{
    public required IEnumerable<MovieResponse>  Genres { get; init; } = Enumerable.Empty<MovieResponse>();
}