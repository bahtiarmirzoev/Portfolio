using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Interfaces;

[ApiController]
[Route("api/actors")]
[Authorize]
public class ActorsController : ControllerBase
{
    private readonly IActorRepository _actorRepository;

    public ActorsController(IActorRepository actorRepository)
    {
        _actorRepository = actorRepository;
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var actor = await _actorRepository.GetByIdAsync(id);
        if (actor == null) return NotFound();
        return Ok(actor);
    }

   
}