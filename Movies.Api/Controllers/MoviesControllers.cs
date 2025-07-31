using Microsoft.AspNetCore.Mvc;
using Movies.Api.Mapping;
using Movies.Application.Models;
using Movies.Application.Repositories;
using Movies.Contracts.Requests;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api")]
public class MoviesControllers : ControllerBase
{
    private   readonly IMovieRepository _movieRepository;

    public MoviesControllers (IMovieRepository movieRepository)
    {
        _movieRepository = movieRepository;
    }
    [HttpPost("movies")]
    public async Task<IActionResult> Create([FromBody] CreateMovieRequest request)
    {
        var movie = request.MapToMovie();
        await _movieRepository.CreateMovieAsync(movie);
        return Created($"/api/movies/{movie.Id}" , movie);
    }
}