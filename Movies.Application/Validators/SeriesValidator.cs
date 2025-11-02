using FluentValidation;
using Movies.Application.Models;

namespace Movies.Application.Validators;

public class SeriesValidator : AbstractValidator<Series>
{
    public SeriesValidator()
    {
        RuleFor(s => s.Id)
            .NotEmpty();

        RuleFor(s => s.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(s => s.YearOfRelease)
            .GreaterThan(1800)
            .LessThanOrEqualTo(DateTime.UtcNow.Year + 5);

        // Условие для YearOfEnd - только если не ongoing и указан
        RuleFor(s => s.YearOfEnd)
            .GreaterThanOrEqualTo(s => s.YearOfRelease)
            .When(s => s.YearOfEnd.HasValue && !s.IsOngoing)
            .WithMessage("Year of end must be greater than or equal to year of release");

        RuleFor(s => s.Description)
            .MaximumLength(2000)
            .When(s => !string.IsNullOrEmpty(s.Description));

        RuleFor(s => s.PosterUrl)
            .Must(BeAValidUrl)
            .When(s => !string.IsNullOrEmpty(s.PosterUrl))
            .WithMessage("PosterUrl must be a valid URL");

        RuleFor(s => s.TrailerUrl)
            .Must(BeAValidUrl)
            .When(s => !string.IsNullOrEmpty(s.TrailerUrl))
            .WithMessage("TrailerUrl must be a valid URL");

        RuleFor(s => s.Genres)
            .NotEmpty()
            .WithMessage("At least one genre is required");

        RuleForEach(s => s.Genres)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(s => s.TotalSeasons)
            .GreaterThan(0)
            .When(s => s.TotalSeasons.HasValue);

        RuleFor(s => s.TotalEpisodes)
            .GreaterThan(0)
            .When(s => s.TotalEpisodes.HasValue);

        // Упрощенное правило для ongoing сериалов
        RuleFor(s => s.YearOfEnd)
            .Null()
            .When(s => s.IsOngoing)
            .WithMessage("Ongoing series should not have an end year");
    }

    private bool BeAValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
               && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}