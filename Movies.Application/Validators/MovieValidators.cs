using FluentValidation;
using Movies.Application.Models;
using Movies.Application.Repositories;

namespace Movies.Application.Validators;

public class MovieValidators : AbstractValidator<Movie>
{
    private readonly IMovieRepository _movieRepository;
    
    public MovieValidators(IMovieRepository movieRepository)
    {
        _movieRepository = movieRepository;
        RuleFor(x =>x.Id)
            .NotEmpty();
        RuleFor(x=>x.Genres)
            .NotEmpty();
        
        RuleFor(x=>x.Title)
            .NotEmpty();
        RuleFor(x=>x.YearOfRelease)
            .LessThanOrEqualTo(DateTime.Now.Year);
        
        RuleFor(x=>x.Slug)
            .MustAsync(ValidateSlug)
            .WithMessage("This movie does already exists in system");
    }

    private async Task<bool> ValidateSlug(Movie movie, string slug, CancellationToken token = default)
    {
        var existingMovie = await _movieRepository.GetBySlugAsync(slug);

        if (existingMovie is not null)
        {
            return existingMovie.Id == movie.Id;
        }

        return existingMovie is null;
    }
}