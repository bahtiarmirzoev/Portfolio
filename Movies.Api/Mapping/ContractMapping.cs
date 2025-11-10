using Movies.Application.Models;
using Movies.Application.Interfaces;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;
using System.Linq;

namespace Movies.Api.Mapping;

public static class ContractMapping
{
    public static async Task<Movie> MapToMovieAsync(this CreateMovieRequest request, IActorRepository actorRepository)
    {
        var actors = new List<Actor>();
        if (request.Actors != null && request.Actors.Any())
        {
            foreach (var actorName in request.Actors)
            {
                if (string.IsNullOrWhiteSpace(actorName)) continue;
                
                var existingActor = await actorRepository.GetByNameAsync(actorName.Trim());
                if (existingActor != null)
                {
                    actors.Add(existingActor);
                }
                else
                {
                    // Создаем нового актера, если не найден
                    var newActor = new Actor
                    {
                        Id = Guid.NewGuid(),
                        Name = actorName.Trim()
                    };
                    await actorRepository.CreateAsync(newActor);
                    actors.Add(newActor);
                }
            }
        }

        return new Movie
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            YearOfRelease = request.Year,
            Description = request.Description,
            PosterUrl = request.PosterUrl,
            TrailerUrl = request.TrailerUrl,
            Genres = request.Genres.ToList(),
            Actors = actors
        };
    }

    public static async Task<Movie> MapToMovieAsync(this UpdateMovieRequest request, Guid id, IActorRepository actorRepository)
    {
        var actors = new List<Actor>();
        if (request.Actors != null && request.Actors.Any())
        {
            foreach (var actorName in request.Actors)
            {
                if (string.IsNullOrWhiteSpace(actorName)) continue;
                
                var existingActor = await actorRepository.GetByNameAsync(actorName.Trim());
                if (existingActor != null)
                {
                    actors.Add(existingActor);
                }
                else
                {
                    // Создаем нового актера, если не найден
                    var newActor = new Actor
                    {
                        Id = Guid.NewGuid(),
                        Name = actorName.Trim()
                    };
                    await actorRepository.CreateAsync(newActor);
                    actors.Add(newActor);
                }
            }
        }

        return new Movie
        {
            Id = id,
            Title = request.Title,
            YearOfRelease = request.Year,
            Description = request.Description,
            PosterUrl = request.PosterUrl,
            TrailerUrl = request.TrailerUrl,
            Genres = request.Genres.ToList(),
            Actors = actors
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