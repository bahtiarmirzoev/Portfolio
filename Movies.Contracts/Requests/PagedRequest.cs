namespace Movies.Contracts.Requests;

public class PagedRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? Genre { get; set; }
    public int? YearFrom { get; set; }
    public int? YearTo { get; set; }
    public string? Actor { get; set; }
    public string? SortBy { get; set; } // 'default', 'year', 'rating', 'title'
    public string? SortOrder { get; set; } = "asc"; // 'asc' or 'desc'
    
    private const int MaxPageSize = 50;
    
    public int Skip => (Page - 1) * PageSize;
    public int Take => PageSize > MaxPageSize ? MaxPageSize : PageSize;
}