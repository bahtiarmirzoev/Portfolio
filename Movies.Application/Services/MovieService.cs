using Movies.Application.Models;
using Movies.Application.Repositories;

namespace Movies.Application.Services;

public class MovieService : IMovieService
{
    
    private readonly IMovieRepository _movieRepository;
    
    public Task<bool> CreateMovieAsync(Movie movie)
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

    public async  Task<bool> UpdateMovieAsync(Movie movie)
    {
       var movieExists = await _movieRepository.ExistsByIdAsync(movie.Id);
       if (!movieExists)
       {
           return false;
       }
       
       return await _movieRepository.UpdateMovieAsync(movie) is null;
    }

    public Task<bool> DeleteMovieByIdAsync(Guid id)
    {
        return _movieRepository.DeleteMovieByIdAsync(id);
    }
}