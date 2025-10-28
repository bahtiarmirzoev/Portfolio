namespace Movies.Contracts.Requests;

public class PagedRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    
    private const int MaxPageSize = 50;
    
    public int Skip => (Page - 1) * PageSize;
    public int Take => PageSize > MaxPageSize ? MaxPageSize : PageSize;
}