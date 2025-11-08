namespace Movies.Contracts.Requests;

public class ActorsPagedRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? SortBy { get; set; } = "name";
    public string? SortOrder { get; set; } = "asc";
    
    private const int MaxPageSize = 50;
    
    public int Skip => (Page - 1) * PageSize;
    public int Take => PageSize > MaxPageSize ? MaxPageSize : PageSize;
}