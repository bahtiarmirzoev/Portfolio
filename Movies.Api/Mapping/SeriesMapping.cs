using Movies.Application.Models;
using Movies.Application.Interfaces;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;
using System.Linq;

namespace Movies.Api.Mapping;

public static class SeriesMapping
{
    public static async Task<Series> MapToSeriesAsync(this CreateSeriesRequest request, IActorRepository actorRepository)
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

        return new Series
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
        };
    }

    public static async Task<Series> MapToSeriesAsync(this UpdateSeriesRequest request, Guid id, IActorRepository actorRepository)
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

        return new Series
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
        };
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