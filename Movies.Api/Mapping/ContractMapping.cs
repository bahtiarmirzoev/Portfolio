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
            AverageRating = movie.AverageRating,
            Genres = movie.Genres.ToList(),
            Actors = movie.Actors.Select(a => new ActorResponse
            {
                Id = a.Id,
                Name = a.Name
            })
        };
    }

    // ✅ ЕДИНСТВЕННЫЙ МЕТОД ДЛЯ ПАГИНАЦИИ
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