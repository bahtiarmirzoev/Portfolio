using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Api.Mapping;
using Movies.Application.Services;
using Movies.Application.Interfaces;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;

[ApiController]
[Route("api/movies")]
public class MoviesController : ControllerBase
{
    private readonly IMovieService _movieService;
    private readonly IActorRepository _actorRepository;

    public MoviesController(IMovieService movieService, IActorRepository actorRepository)
    {
        _movieService = movieService;
        _actorRepository = actorRepository;
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateMovieRequest request)
    {
        var movie = await request.MapToMovieAsync(_actorRepository);
        await _movieService.CreateMovieAsync(movie);
        var response = movie.MapToResponse();
        return CreatedAtAction(nameof(Get), new { idOrSlug = movie.Id }, response);
    }

    [HttpGet("{idOrSlug}")]
    [AllowAnonymous]
    public async Task<IActionResult> Get([FromRoute] string idOrSlug)
    {
        var movie = Guid.TryParse(idOrSlug, out var id)
            ? await _movieService.GetByIdAsync(id)
            : await _movieService.GetBySlugAsync(idOrSlug);

        if (movie == null)
            return NotFound();

        var response = movie.MapToResponse();
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateMovieRequest request)
    {
        var movie = await request.MapToMovieAsync(id, _actorRepository);
        var updatedMovie = await _movieService.UpdateMovieAsync(movie);
        if (updatedMovie is null)
            return NotFound();

        var response = updatedMovie.MapToResponse();
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var deleted = await _movieService.DeleteMovieByIdAsync(id);
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
            var searchResult = await _movieService.SearchAsync(
                request.Search, 
                request.Skip, 
                request.Take,
                request.SortBy,
                sortOrder);
            var searchResponse = searchResult.MapToResponse(request);
            return Ok(searchResponse);
        }

        // 2. Если есть фильтры - используем фильтрацию
        if (!string.IsNullOrWhiteSpace(request.Genre) || 
            request.YearFrom.HasValue || 
            request.YearTo.HasValue || 
            !string.IsNullOrWhiteSpace(request.Actor))
        {
            var filterResult = await _movieService.FilterAsync(
                request.Genre, 
                request.YearFrom, 
                request.YearTo, 
                request.Actor,
                request.Skip, 
                request.Take,
                request.SortBy,
                sortOrder);
                
            var filterResponse = filterResult.MapToResponse(request);
            return Ok(filterResponse);
        }
        
        // 3. Иначе - обычный список с пагинацией
        var result = await _movieService.GetAllAsync(request.Skip, request.Take, request.SortBy, sortOrder);
        var response = result.MapToResponse(request);
        return Ok(response);
    }

    [HttpGet("{id:guid}/similar")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSimilar([FromRoute] Guid id, [FromQuery] int count = 5)
    {
        var similarMovies = await _movieService.GetSimilarMoviesAsync(id, count);
        var response = similarMovies.Select(m => m.MapToResponse());
        return Ok(response);
    }
}