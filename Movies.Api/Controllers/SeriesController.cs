using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Api.Mapping;
using Movies.Application.Services;
using Movies.Application.Interfaces;
using Movies.Contracts.Requests;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/series")]
public class SeriesController : ControllerBase
{
    private readonly ISeriesService _seriesService;
    private readonly IActorRepository _actorRepository;

    public SeriesController(ISeriesService seriesService, IActorRepository actorRepository)
    {
        _seriesService = seriesService;
        _actorRepository = actorRepository;
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateSeriesRequest request)
    {
        var series = await request.MapToSeriesAsync(_actorRepository);
        await _seriesService.CreateSeriesAsync(series);
        var response = series.MapToResponse();
        return CreatedAtAction(nameof(Get), new { idOrSlug = series.Id }, response);
    }

    [HttpGet("{idOrSlug}")]
    [AllowAnonymous]
    public async Task<IActionResult> Get([FromRoute] string idOrSlug)
    {
        var series = Guid.TryParse(idOrSlug, out var id)
            ? await _seriesService.GetByIdAsync(id)
            : await _seriesService.GetBySlugAsync(idOrSlug);

        if (series == null)
            return NotFound();

        var response = series.MapToResponse();
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateSeriesRequest request)
    {
        var series = await request.MapToSeriesAsync(id, _actorRepository);
        var updatedSeries = await _seriesService.UpdateSeriesAsync(series);
        if (updatedSeries is null)
            return NotFound();

        var response = updatedSeries.MapToResponse();
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var deleted = await _seriesService.DeleteSeriesByIdAsync(id);
        if (!deleted)
            return NotFound();

        return Ok();
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request)
    {
        // Определяем направление сортировки на основе sortBy
        // Для year и rating по умолчанию desc, для title - asc
        var sortOrder = request.SortOrder ?? 
            (request.SortBy?.ToLower() == "year" || request.SortBy?.ToLower() == "rating" ? "desc" : "asc");
        
        // 1. Если есть поисковый запрос - используем поиск
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchResult = await _seriesService.SearchAsync(
                request.Search, 
                request.Skip, 
                request.Take,
                request.SortBy,
                sortOrder);
            var searchResponse = searchResult.MapToSeriesResponse(request);
            return Ok(searchResponse);
        }

        // 2. Если есть фильтры - используем фильтрацию
        if (!string.IsNullOrWhiteSpace(request.Genre) || 
            request.YearFrom.HasValue || 
            request.YearTo.HasValue || 
            !string.IsNullOrWhiteSpace(request.Actor))
        {
            var filterResult = await _seriesService.FilterAsync(
                request.Genre, 
                request.YearFrom, 
                request.YearTo, 
                request.Actor,
                request.Skip, 
                request.Take,
                request.SortBy,
                sortOrder);
                
            var filterResponse = filterResult.MapToSeriesResponse(request);
            return Ok(filterResponse);
        }
        
        // 3. Иначе - обычный список с пагинацией
        var result = await _seriesService.GetAllAsync(request.Skip, request.Take, request.SortBy, sortOrder);
        var response = result.MapToSeriesResponse(request);
        return Ok(response);
    }

    [HttpGet("ongoing")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOngoing([FromQuery] PagedRequest request)
    {
        // Определяем направление сортировки на основе sortBy
        var sortOrder = request.SortOrder ?? 
            (request.SortBy?.ToLower() == "year" || request.SortBy?.ToLower() == "rating" ? "desc" : "asc");
        
        var result = await _seriesService.GetOngoingAsync(request.Skip, request.Take, request.SortBy, sortOrder);
        var response = result.MapToSeriesResponse(request);
        return Ok(response);
    }

    [HttpGet("{id:guid}/similar")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSimilar([FromRoute] Guid id, [FromQuery] int count = 5)
    {
        var similarSeries = await _seriesService.GetSimilarSeriesAsync(id, count);
        var response = similarSeries.Select(s => s.MapToResponse());
        return Ok(response);
    }
}