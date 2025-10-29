using Movies.Application.Models;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;

namespace Movies.Api.Mapping;

public static class ContractMapping
{
    public static Movie MapToMovie(this CreateMovieRequest request)
    {
        return new Movie
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            YearOfRelease = request.Year,
            Description = request.Description, // 🆕 Добавляем описание
            PosterUrl = request.PosterUrl, // 🆕 Маппим постер
            TrailerUrl = request.TrailerUrl, // 🆕 Маппим трейлер
            Genres = request.Genres.ToList(),
            Actors = request.Actors?.Select(actorName => new Actor
            {
                Id = Guid.NewGuid(),
                Name = actorName
            }).ToList() ?? new List<Actor>()
        };
    }

    public static Movie MapToMovie(this UpdateMovieRequest request, Guid id)
    {
        return new Movie
        {
            Id = id,
            Title = request.Title,
            YearOfRelease = request.Year,
            Description = request.Description, // 🆕 Добавляем описание
            PosterUrl = request.PosterUrl, // 🆕 Маппим постер
            TrailerUrl = request.TrailerUrl, // 🆕 Маппим трейлер
            Genres = request.Genres.ToList(),
            Actors = request.Actors?.Select(actorName => new Actor
            {
                Id = Guid.NewGuid(),
                Name = actorName
            }).ToList() ?? new List<Actor>()
        };
    }

    public static MovieResponse MapToResponse(this Movie movie)
    {
        return new MovieResponse
        {
            Id = movie.Id,
            Title = movie.Title,
            Slug = movie.Slug,
            Year = movie.YearOfRelease,
            Description = movie.Description,
            PosterUrl = movie.PosterUrl, // ✅ Используем movie.PosterUrl
            TrailerUrl = movie.TrailerUrl, // ✅ Используем movie.TrailerUrl
            AverageRating = movie.AverageRating,
            Genres = movie.Genres.ToList(),
            Actors = movie.Actors.Select(a => new ActorResponse
            {
                Id = a.Id,
                Name = a.Name
            })
        };
    }

    public static MoviesResponse MapToResponse(this (IEnumerable<Movie> movies, int totalCount) result, PagedRequest request)
    {
        return new MoviesResponse
        {
            Items = result.movies.Select(MapToResponse),
            Page = request.Page,
            PageSize = request.Take,
            TotalCount = result.totalCount
        };
    }
}