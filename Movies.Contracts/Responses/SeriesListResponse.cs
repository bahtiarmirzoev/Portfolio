namespace Movies.Contracts.Responses;

public class SeriesListResponse
{
    public required IEnumerable<SeriesResponse> Items { get; init; } = Enumerable.Empty<SeriesResponse>();
    
    public required int Page { get; init; }
    
    public required int PageSize { get; init; }
    
    public required int TotalCount { get; init; }
    
    public bool HasNextPage => (Page * PageSize) < TotalCount;
}