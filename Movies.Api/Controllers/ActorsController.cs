using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;

[ApiController]
[Route("api/actors")]
[Authorize(Roles = "admin")]
public class ActorsController : ControllerBase
{
    private readonly IActorRepository _actorRepository;

    public ActorsController(IActorRepository actorRepository)
    {
        _actorRepository = actorRepository;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateActorRequest request)
    {
        var actor = new Actor
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            DateOfBirth = request.DateOfBirth,
            Biography = request.Biography
        };

        var result = await _actorRepository.CreateAsync(actor);
        if (!result) return BadRequest();
        
        // Возвращаем ActorResponse вместо Actor
        var response = new ActorResponse
        {
            Id = actor.Id,
            Name = actor.Name
        };
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateActorRequest request)
    {
        var actor = new Actor
        {
            Id = id,
            Name = request.Name,
            DateOfBirth = request.DateOfBirth,
            Biography = request.Biography
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
    public async Task<IActionResult> GetAll()
    {
        var actors = await _actorRepository.GetAllAsync();
        // Маппим на ActorResponse
        var response = actors.Select(a => new ActorResponse
        {
            Id = a.Id,
            Name = a.Name
        });
        return Ok(response);
    }
}