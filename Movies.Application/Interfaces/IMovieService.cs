using Movies.Application.Models;

namespace Movies.Application.Services;

public interface IMovieService
{
    Task<bool> CreateMovieAsync(Movie movie);
    Task<Movie?> GetByIdAsync(Guid id);
    Task<Movie?> GetBySlugAsync(string slug);
    Task<IEnumerable<Movie>> GetAllAsync();
    Task<Movie?> UpdateMovieAsync(Movie movie);
    Task<bool> DeleteMovieByIdAsync(Guid id);
    
    Task<(IEnumerable<Movie> movies, int totalCount)> GetAllAsync(int skip, int take); 
    Task<(IEnumerable<Movie> movies, int totalCount)> SearchAsync(string search, int skip, int take);
    
    Task<(IEnumerable<Movie> movies, int totalCount)> FilterAsync(
        string? genre, 
        int? yearFrom, 
        int? yearTo, 
        string? actor,
        int skip, 
        int take);
    
    Task<IEnumerable<Movie>> GetSimilarMoviesAsync(Guid movieId, int count = 5);
}