using Movies.Application.Models;
using Movies.Application.Interfaces;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;
using System.Linq;

namespace Movies.Api.Mapping;

public static class SeriesMapping
{
    public static Task<Series> MapToSeriesAsync(this CreateSeriesRequest request, IActorRepository actorRepository)
    {
        // Актеры будут созданы автоматически в репозитории при сохранении сериала
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

        return Task.FromResult(new Series
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            YearOfRelease = request.YearOfRelease,
            YearOfEnd = request.IsOngoing ? null : request.YearOfEnd,
            Description = request.Description,
            PosterUrl = request.PosterUrl,
            TrailerUrl = request.TrailerUrl,
            Genres = request.Genres.ToList(),
            TotalSeasons = request.TotalSeasons,
            TotalEpisodes = request.TotalEpisodes,
            IsOngoing = request.IsOngoing,
            Actors = actors
        });
    }

    public static Task<Series> MapToSeriesAsync(this UpdateSeriesRequest request, Guid id, IActorRepository actorRepository)
    {
        // Актеры будут созданы автоматически в репозитории при обновлении сериала
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

        return Task.FromResult(new Series
        {
            Id = id,
            Title = request.Title,
            YearOfRelease = request.YearOfRelease,
            YearOfEnd = request.IsOngoing ? null : request.YearOfEnd,
            Description = request.Description,
            PosterUrl = request.PosterUrl,
            TrailerUrl = request.TrailerUrl,
            Genres = request.Genres.ToList(),
            TotalSeasons = request.TotalSeasons,
            TotalEpisodes = request.TotalEpisodes,
            IsOngoing = request.IsOngoing,
            Actors = actors
        });
    }

    public static SeriesResponse MapToResponse(this Series series)
    {
        return new SeriesResponse
        {
            Id = series.Id,
            Title = series.Title,
            Slug = series.Slug,
            YearOfRelease = series.YearOfRelease,
            YearOfEnd = series.YearOfEnd,
            Description = series.Description,
            PosterUrl = series.PosterUrl,
            TrailerUrl = series.TrailerUrl,
            AverageRating = series.AverageRating,
            Genres = series.Genres.ToList(),
            TotalSeasons = series.TotalSeasons,
            TotalEpisodes = series.TotalEpisodes,
            IsOngoing = series.IsOngoing,
            Actors = series.Actors.Select(a => new ActorResponse
            {
                Id = a.Id,
                Name = a.Name
            })
        };
    }

    public static SeriesListResponse MapToSeriesResponse(
        this (IEnumerable<Series> series, int totalCount) result, 
        PagedRequest request)
    {
        return new SeriesListResponse
        {
            Items = result.series.Select(MapToResponse),
            Page = request.Page,
            PageSize = request.Take,
            TotalCount = result.totalCount
        };
    }
}