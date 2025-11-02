using FluentValidation;
using Movies.Application.Interfaces;
using Movies.Application.Models;

namespace Movies.Application.Services;

public class SeriesService : ISeriesService
{
    private readonly ISeriesRepository _seriesRepository;
    private readonly IValidator<Series> _seriesValidator;

    public SeriesService(
        ISeriesRepository seriesRepository, 
        IValidator<Series> seriesValidator)
    {
        _seriesRepository = seriesRepository;
        _seriesValidator = seriesValidator;
    }

    public async Task<bool> CreateSeriesAsync(Series series)
    {
        await _seriesValidator.ValidateAndThrowAsync(series);
        return await _seriesRepository.CreateSeriesAsync(series);
    }

    public async Task<Series?> GetByIdAsync(Guid id)
    {
        return await _seriesRepository.GetByIdAsync(id);
    }

    // ДОБАВЬТЕ ЭТОТ МЕТОД - он отсутствует в вашей реализации
    public async Task<Series?> GetBySlugAsync(string slug)
    {
        return await _seriesRepository.GetBySlugAsync(slug);
    }

    public async Task<IEnumerable<Series>> GetAllAsync()
    {
        return await _seriesRepository.GetAllAsync();
    }

    public async Task<Series?> UpdateSeriesAsync(Series series)
    {
        await _seriesValidator.ValidateAndThrowAsync(series);
        var seriesExists = await _seriesRepository.ExistsByIdAsync(series.Id);
        if (!seriesExists)
        {
            return null;
        }

        await _seriesRepository.UpdateSeriesAsync(series);
        return series;
    }

    public Task<bool> DeleteSeriesByIdAsync(Guid id)
    {
        return _seriesRepository.DeleteSeriesByIdAsync(id);
    }
    
    public async Task<(IEnumerable<Series> series, int totalCount)> GetAllAsync(int skip, int take)
    {
        return await _seriesRepository.GetAllAsync(skip, take);
    }

    public async Task<(IEnumerable<Series> series, int totalCount)> SearchAsync(
        string search, int skip, int take)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return await _seriesRepository.GetAllAsync(skip, take);
        }
    
        return await _seriesRepository.SearchAsync(search, skip, take);
    }

    public async Task<(IEnumerable<Series> series, int totalCount)> FilterAsync(
        string? genre, 
        int? yearFrom, 
        int? yearTo, 
        string? actor,
        int skip, 
        int take)
    {
        return await _seriesRepository.FilterAsync(genre, yearFrom, yearTo, actor, skip, take);
    }

    public async Task<(IEnumerable<Series> series, int totalCount)> GetOngoingAsync(int skip, int take)
    {
        return await _seriesRepository.GetOngoingAsync(skip, take);
    }
}