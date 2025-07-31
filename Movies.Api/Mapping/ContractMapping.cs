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
            Year = request.Year,
            Genres = request.Genres.ToList()
        };
    }

    public static Movie MapToMovie(this UpdateMovieRequest request, Guid id)
    {
        return new Movie
        {
            Id = id,
            Title = request.Title,
            Year = request.Year,
            Genres = request.Genres.ToList()
        };
    }
    public static MovieResponse MapToResponse(this Movie movie)
    {
        return new MovieResponse
        {
            Id = Guid.NewGuid(),
            Title = movie.Title,
            Slug = movie.Slug,
            Year = movie.Year,
            Genres = movie.Genres.ToList()
        };
    }

    public static MoviesResponse MapToResponse(this IEnumerable<Movie> movies)
    {
        return new MoviesResponse
        {
            Items = movies.Select(MapToResponse)
        };
    }
}