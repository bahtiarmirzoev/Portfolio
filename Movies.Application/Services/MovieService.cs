using Movies.Application.Models;
using Movies.Application.Repositories;

namespace Movies.Application.Services;

public class MovieService : IMovieService
{
    
    private readonly IMovieRepository _movieRepository;
    
    public Task<Movie?> CreateMovieAsync(Movie movie)
    {
        return _movieRepository.CreateMovieAsync(movie);
    }

    public Task<Movie?> GetByIdAsync(Guid id)
    {
        return _movieRepository.GetByIdAsync(id);
    }

    public Task<Movie?> GetBySlugAsync(string slug)
    {
        return _movieRepository.GetBySlugAsync(slug);
    }

    public Task<IEnumerable<Movie>> GetAllAsync()
    {
       return _movieRepository.GetAllAsync();
    }

    public Task<Movie> UpdateMovieAsync(Movie movie)
    {
        return _movieRepository.UpdateMovieAsync(movie);
    }

    public Task<Movie?> DeleteMovieByIdAsync(Guid id)
    {
        return _movieRepository.DeleteMovieByIdAsync(id);
    }
}