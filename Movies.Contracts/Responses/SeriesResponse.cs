namespace Movies.Contracts.Responses;

public class SeriesResponse
{
    public required Guid Id { get; init; }
    
    public required string Title { get; init; }
    
    public required string Slug { get; init; }
    
    public required int YearOfRelease { get; init; }
    
    public int? YearOfEnd { get; init; }
    
    public string? Description { get; init; }
    
    public string? PosterUrl { get; init; }
    
    public string? TrailerUrl { get; init; }
    
    public double? AverageRating { get; init; }
    
    public required IEnumerable<string> Genres { get; init; } = Enumerable.Empty<string>();
    
    public IEnumerable<ActorResponse> Actors { get; init; } = Enumerable.Empty<ActorResponse>();
    
    public int? TotalSeasons { get; init; }
    
    public int? TotalEpisodes { get; init; }
    
    public bool IsOngoing { get; init; }
}