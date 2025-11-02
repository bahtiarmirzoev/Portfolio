using Movies.Application.Models;

namespace Movies.Application.Interfaces;

public interface ISeriesRepository
{
    Task<bool> CreateSeriesAsync(Series series);
    Task<Series?> GetByIdAsync(Guid id);
    Task<Series?> GetBySlugAsync(string slug);
    Task<IEnumerable<Series>> GetAllAsync();
    Task<bool> UpdateSeriesAsync(Series series);
    Task<bool> DeleteSeriesByIdAsync(Guid id);
    Task<bool> ExistsByIdAsync(Guid id);
    Task<(IEnumerable<Series> series, int totalCount)> GetAllAsync(int skip, int take);
    Task<(IEnumerable<Series> series, int totalCount)> SearchAsync(string search, int skip, int take);
    Task<(IEnumerable<Series> series, int totalCount)> FilterAsync(
        string? genre, 
        int? yearFrom, 
        int? yearTo, 
        string? actor,
        int skip, 
        int take);
    Task<(IEnumerable<Series> series, int totalCount)> GetOngoingAsync(int skip, int take);
}