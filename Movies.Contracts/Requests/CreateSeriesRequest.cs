namespace Movies.Contracts.Requests;

public class CreateSeriesRequest
{
    public required string Title { get; init; }
    
    public required int YearOfRelease { get; init; }
    
    public int? YearOfEnd { get; init; }
    
    public string? Description { get; init; }
    
    public string? PosterUrl { get; init; }
    
    public string? TrailerUrl { get; init; }
    
    public string? WatchUrl { get; init; } // Ссылка на внешний киносервис для просмотра
    
    public required IEnumerable<string> Genres { get; init; } = Enumerable.Empty<string>();
    
    public IEnumerable<string> Actors { get; init; } = Enumerable.Empty<string>();
    
    public int? TotalSeasons { get; init; }
    
    public int? TotalEpisodes { get; init; }
    
    public bool IsOngoing { get; init; }
}