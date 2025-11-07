using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;
using Movies.Api.Mapping;

[ApiController]
[Route("api/actors")]
public class ActorsController : ControllerBase
{
    private readonly IActorRepository _actorRepository;

    public ActorsController(IActorRepository actorRepository)
    {
        _actorRepository = actorRepository;
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateActorRequest request)
    {
        var actor = new Actor
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
          
        };

        var result = await _actorRepository.CreateAsync(actor);
        if (!result) return BadRequest();
        
      
        var response = new ActorResponse
        {
            Id = actor.Id,
            Name = actor.Name
        };
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateActorRequest request)
    {
        var actor = new Actor
        {
            Id = id,
            Name = request.Name,
            
        };

        var result = await _actorRepository.UpdateAsync(actor);
        if (!result) return NotFound();
        
        // Возвращаем ActorResponse вместо Actor
        var response = new ActorResponse
        {
            Id = actor.Id,
            Name = actor.Name
        };
        return Ok(response);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? sortBy = "name", [FromQuery] string? sortOrder = "asc")
    {
        var actors = await _actorRepository.GetAllAsync(sortBy, sortOrder);
        
        // Убираем дубликаты по ID и маппим на ActorResponse
        var uniqueActors = actors
            .GroupBy(a => a.Id)
            .Select(g => g.First())
            .Select(a => new ActorResponse
            {
                Id = a.Id,
                Name = a.Name,
                DateOfBirth = a.DateOfBirth,
                Biography = a.Biography
            });
            
        return Ok(uniqueActors);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById([FromRoute] Guid id)
    {
        var actor = await _actorRepository.GetByIdAsync(id);
        if (actor == null) return NotFound();

        var movies = await _actorRepository.GetMoviesByActorIdAsync(id);
        var series = await _actorRepository.GetSeriesByActorIdAsync(id);

        var response = new ActorDetailResponse
        {
            Id = actor.Id,
            Name = actor.Name,
            DateOfBirth = actor.DateOfBirth,
            Biography = actor.Biography,
            Movies = movies.Select(m => m.MapToResponse()),
            Series = series.Select(s => s.MapToResponse())
        };

        return Ok(response);
    }
}