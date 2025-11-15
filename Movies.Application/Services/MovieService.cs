using FluentValidation;
using Movies.Application.Models;
using Movies.Application.Repositories;
using Movies.Application.Services;

public class MovieService : IMovieService
{
    private readonly IMovieRepository _movieRepository;
    private readonly IValidator<Movie> _movieValidator;

    public MovieService(
        IMovieRepository movieRepository, 
        IValidator<Movie> movieValidator
    )
    {
        _movieRepository = movieRepository;
        _movieValidator = movieValidator;
    }

    public async Task<bool> CreateMovieAsync(Movie movie)
    {
        await _movieValidator.ValidateAndThrowAsync(movie);
        return await _movieRepository.CreateMovieAsync(movie);
    }

    public async Task<Movie?> GetByIdAsync(Guid id)
    {
        return await _movieRepository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<Movie>> GetAllAsync()
    {
        return await _movieRepository.GetAllAsync();
    }

    public async Task<Movie?> GetBySlugAsync(string slug)
    {
        return await _movieRepository.GetBySlugAsync(slug);
    }

    public async Task<Movie?> UpdateMovieAsync(Movie movie)
    {
        await _movieValidator.ValidateAndThrowAsync(movie);
        var movieExists = await _movieRepository.ExistsByIdAsync(movie.Id);
        if (!movieExists)
        {
            return null;
        }

        await _movieRepository.UpdateMovieAsync(movie);
        // Загружаем обновленный фильм из базы данных, чтобы получить все связанные данные
        return await _movieRepository.GetByIdAsync(movie.Id);
    }

    public Task<bool> DeleteMovieByIdAsync(Guid id)
    {
        return _movieRepository.DeleteMovieByIdAsync(id);
    }
    
    public async Task<(IEnumerable<Movie> movies, int totalCount)> GetAllAsync(int skip, int take)
    {
        return await _movieRepository.GetAllAsync(skip, take);
    }

    public async Task<(IEnumerable<Movie> movies, int totalCount)> SearchAsync(string search, int skip, int take)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return await _movieRepository.GetAllAsync(skip, take);
        }
    
        return await _movieRepository.SearchAsync(search, skip, take);
    }

    public async Task<(IEnumerable<Movie> movies, int totalCount)> FilterAsync(
        string? genre, 
        int? yearFrom, 
        int? yearTo, 
        string? actor,
        int skip, 
        int take)
    {
        return await _movieRepository.FilterAsync(genre, yearFrom, yearTo, actor, skip, take);
    }
    
    public async Task<IEnumerable<Movie>> GetSimilarMoviesAsync(Guid movieId, int count = 5)
    {
        return await _movieRepository.GetSimilarMoviesAsync(movieId, count);
    }
}