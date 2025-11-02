using Movies.Application.Models;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;

namespace Movies.Api.Mapping;

public static class SeriesMapping
{
    public static Series MapToSeries(this CreateSeriesRequest request)
    {
        return new Series
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            YearOfRelease = request.YearOfRelease,
            YearOfEnd = request.YearOfEnd,
            Description = request.Description,
            PosterUrl = request.PosterUrl,
            TrailerUrl = request.TrailerUrl,
            Genres = request.Genres.ToList(),
            TotalSeasons = request.TotalSeasons,
            TotalEpisodes = request.TotalEpisodes,
            IsOngoing = request.IsOngoing,
            Actors = request.Actors?.Select(actorName => new Actor
            {
                Id = Guid.NewGuid(),
                Name = actorName
            }).ToList() ?? new List<Actor>()
        };
    }

    public static Series MapToSeries(this UpdateSeriesRequest request, Guid id)
    {
        return new Series
        {
            Id = id,
            Title = request.Title,
            YearOfRelease = request.YearOfRelease,
            YearOfEnd = request.YearOfEnd == 0 ? null : request.YearOfEnd,
            Description = request.Description,
            PosterUrl = request.PosterUrl,
            TrailerUrl = request.TrailerUrl,
            Genres = request.Genres.ToList(),
            TotalSeasons = request.TotalSeasons,
            TotalEpisodes = request.TotalEpisodes,
            IsOngoing = request.IsOngoing,
            Actors = request.Actors?.Select(actorName => new Actor
            {
                Id = Guid.NewGuid(),
                Name = actorName
            }).ToList() ?? new List<Actor>()
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