using Movies.Application.Models;

namespace Movies.Application.Repositories;

public interface IMovieRepository
{
    Task<bool> CreateMovieAsync (Movie movie);
    
    Task<Movie?> GetByIdAsync (Guid id);
    
    Task<Movie?> GetBySlugAsync ( string slug);
    Task<IEnumerable<Movie>> GetAllAsync ();
    
    Task<bool> UpdateMovieAsync (Movie movie);
    
    Task<bool> DeleteMovieByIdAsync (Guid id);
    
    Task<bool> ExistsByIdAsync(Guid id);
    
    Task<(IEnumerable<Movie> movies, int totalCount)> GetAllAsync(int skip, int take); 
    
}