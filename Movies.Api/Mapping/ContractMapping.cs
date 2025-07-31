using Movies.Application.Models;
using Movies.Contracts.Requests;

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
}