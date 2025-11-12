using Movies.Application.Models;
using Movies.Application.Interfaces;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;
using System.Linq;

namespace Movies.Api.Mapping;

public static class ContractMapping
{
    public static Task<Movie> MapToMovieAsync(this CreateMovieRequest request, IActorRepository actorRepository)
    {
        // Актеры будут созданы автоматически в репозитории при сохранении фильма
        // Здесь просто создаем объекты Actor с именами для передачи в репозиторий
        var actors = new List<Actor>();
        if (request.Actors != null && request.Actors.Any())
        {
            foreach (var actorName in request.Actors)
            {
                if (string.IsNullOrWhiteSpace(actorName)) continue;
                
                // Создаем временный объект Actor с именем
                // Репозиторий проверит существование по имени и создаст актера, если его нет
                var actor = new Actor
                {
                    Id = Guid.NewGuid(), // Временный ID, будет заменен на существующий или использован для нового
                    Name = actorName.Trim()
                };
                actors.Add(actor);
            }
        }

        return Task.FromResult(new Movie
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            YearOfRelease = request.Year,
            Description = request.Description,
            PosterUrl = request.PosterUrl,
            TrailerUrl = request.TrailerUrl,
            Genres = request.Genres.ToList(),
            Actors = actors
        });
    }

    public static Task<Movie> MapToMovieAsync(this UpdateMovieRequest request, Guid id, IActorRepository actorRepository)
    {
        // Актеры будут созданы автоматически в репозитории при обновлении фильма
        // Здесь просто создаем объекты Actor с именами для передачи в репозиторий
        var actors = new List<Actor>();
        if (request.Actors != null && request.Actors.Any())
        {
            foreach (var actorName in request.Actors)
            {
                if (string.IsNullOrWhiteSpace(actorName)) continue;
                
                // Создаем временный объект Actor с именем
                // Репозиторий проверит существование по имени и создаст актера, если его нет
                var actor = new Actor
                {
                    Id = Guid.NewGuid(), // Временный ID, будет заменен на существующий или использован для нового
                    Name = actorName.Trim()
                };
                actors.Add(actor);
            }
        }

        return Task.FromResult(new Movie
        {
            Id = id,
            Title = request.Title,
            YearOfRelease = request.Year,
            Description = request.Description,
            PosterUrl = request.PosterUrl,
            TrailerUrl = request.TrailerUrl,
            Genres = request.Genres.ToList(),
            Actors = actors
        });
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