using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Api.Mapping;
using Movies.Application.Services;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;

[ApiController]
[Route("api/movies")]
[Authorize]
public class MoviesController : ControllerBase
{
    private readonly IMovieService _movieService;

    public MoviesController(IMovieService movieService)
    {
        _movieService = movieService;
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateMovieRequest request)
    {
        var movie = request.MapToMovie();
        await _movieService.CreateMovieAsync(movie);
        return CreatedAtAction(nameof(Get), new { idOrSlug = movie.Id }, movie);
    }

    [HttpGet("{idOrSlug}")]
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

    // ❌ УДАЛИ ЭТОТ СТАРЫЙ МЕТОД
    // [HttpGet]
    // public async Task<IActionResult> GetAll()
    // {
    //     var movies = await _movieService.GetAllAsync();
    //     var moviesResponse = movies.MapToResponse();
    //     return Ok(moviesResponse);
    // }

    // ✅ ОСТАВЬ ТОЛЬКО ЭТОТ МЕТОД С ПАГИНАЦИЕЙ
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request)
    {
        var result = await _movieService.GetAllAsync(request.Skip, request.Take);
        var response = result.MapToResponse(request);
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateMovieRequest request)
    {
        var movie = request.MapToMovie(id);
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
}