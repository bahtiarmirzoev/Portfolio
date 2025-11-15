using Movies.Application.Models;

namespace Movies.Application.Services;

public interface ISeriesService
{
    Task<bool> CreateSeriesAsync(Series series);
    Task<Series?> GetByIdAsync(Guid id);
    Task<Series?> GetBySlugAsync(string slug);
    Task<IEnumerable<Series>> GetAllAsync();
    Task<Series?> UpdateSeriesAsync(Series series);
    Task<bool> DeleteSeriesByIdAsync(Guid id);
    Task<(IEnumerable<Series> series, int totalCount)> GetAllAsync(int skip, int take, string? sortBy = null, string? sortOrder = "asc");
    Task<(IEnumerable<Series> series, int totalCount)> SearchAsync(string search, int skip, int take, string? sortBy = null, string? sortOrder = "asc");
    Task<(IEnumerable<Series> series, int totalCount)> FilterAsync(
        string? genre, 
        int? yearFrom, 
        int? yearTo, 
        string? actor,
        int skip, 
        int take,
        string? sortBy = null,
        string? sortOrder = "asc");
    Task<(IEnumerable<Series> series, int totalCount)> GetOngoingAsync(int skip, int take, string? sortBy = null, string? sortOrder = "asc");
    Task<IEnumerable<Series>> GetSimilarSeriesAsync(Guid seriesId, int count = 5);
}