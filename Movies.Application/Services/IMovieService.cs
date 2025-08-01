
using Movies.Application.Models;

namespace Movies.Application.Services;

public interface IMovieService
{
    Task<Movie?> CreateMovieAsync (Movie movie);
    
    Task<Movie?> GetByIdAsync (Guid id);
    
    Task<Movie?> GetBySlugAsync ( string slug);
    Task<IEnumerable<Movie>> GetAllAsync ();
    
    Task<Movie?> UpdateMovieAsync (Movie movie);
    
    Task<Movie?> DeleteMovieByIdAsync (Guid id);
}