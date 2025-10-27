using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using Movies.Contracts.Requests;

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
        return result ? Ok(actor) : BadRequest();
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
        return result ? Ok(actor) : NotFound();
    }

    [HttpGet]
    [AllowAnonymous] // Все могут видеть актеров
    public async Task<IActionResult> GetAll()
    {
        var actors = await _actorRepository.GetAllAsync();
        return Ok(actors);
    }
}