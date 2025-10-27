using FluentValidation;
using Movies.Application.Models;
using Movies.Application.Repositories;
using Movies.Application.Interfaces;

namespace Movies.Application.Services;

public class MovieService : IMovieService
{
    private readonly IMovieRepository _movieRepository;
    private readonly IValidator<Movie> _movieValidator;
    private readonly IRatingRepository _ratingRepository; // ✅ новое поле

    public MovieService(
        IMovieRepository movieRepository, 
        IValidator<Movie> movieValidator,
        IRatingRepository ratingRepository // ✅ добавить параметр
    )
    {
        _movieRepository = movieRepository;
        _movieValidator = movieValidator;
        _ratingRepository = ratingRepository; // ✅ сохранить зависимость
    }

    public async Task<bool> CreateMovieAsync(Movie movie)
    {
        await _movieValidator.ValidateAndThrowAsync(movie);
        return await _movieRepository.CreateMovieAsync(movie);
    }

    public async Task<Movie?> GetByIdAsync(Guid id)
    {
        var movie = await _movieRepository.GetByIdAsync(id);
        if (movie == null) return null;

        // ✅ Получаем средний рейтинг
        var avgRating = await _ratingRepository.GetMovieAverageRatingAsync(id);
        movie.AverageRating = avgRating;

        return movie;
    }

    public async Task<IEnumerable<Movie>> GetAllAsync()
    {
        var movies = await _movieRepository.GetAllAsync();

        // ✅ Для каждого фильма получаем средний рейтинг
        var result = new List<Movie>();
        foreach (var movie in movies)
        {
            var avgRating = await _ratingRepository.GetMovieAverageRatingAsync(movie.Id);
            movie.AverageRating = avgRating;
            result.Add(movie);
        }

        return result;
    }

    public async Task<Movie?> GetBySlugAsync(string slug)
    {
        var movie = await _movieRepository.GetBySlugAsync(slug);
        if (movie == null) return null;

        movie.AverageRating = await _ratingRepository.GetMovieAverageRatingAsync(movie.Id);
        return movie;
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
        return movie;
    }

    public Task<bool> DeleteMovieByIdAsync(Guid id)
    {
        return _movieRepository.DeleteMovieByIdAsync(id);
    }
}
