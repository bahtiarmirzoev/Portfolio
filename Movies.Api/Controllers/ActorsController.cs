using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Api.Mapping;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;

[ApiController]
[Route("api/actors")]
public class ActorsController : ControllerBase
{
    private readonly IActorRepository _actorRepository;
    private readonly ILogger<ActorsController> _logger;

    public ActorsController(IActorRepository actorRepository, ILogger<ActorsController> logger)
    {
        _actorRepository = actorRepository;
        _logger = logger;
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateActorRequest request, CancellationToken token = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Actor name is required");
            }

            // Проверка на существующего актера с таким же именем
            var existingActor = await _actorRepository.GetByNameAsync(request.Name.Trim(), token);
            if (existingActor != null)
            {
                return Conflict($"Actor with name '{request.Name}' already exists");
            }

            var actor = new Actor
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                DateOfBirth = request.DateOfBirth,
                Biography = string.IsNullOrWhiteSpace(request.Biography) ? null : request.Biography.Trim()
            };

            var result = await _actorRepository.CreateAsync(actor, token);
            if (!result)
            {
                _logger.LogWarning("Failed to create actor: {Name}", request.Name);
                return BadRequest("Failed to create actor");
            }

            _logger.LogInformation("Actor created: {Name} ({Id})", actor.Name, actor.Id);
        
            var response = actor.MapToResponse();
            return CreatedAtAction(nameof(GetById), new { id = actor.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating actor: {Name}. Exception: {Exception}", request.Name, ex);
            return StatusCode(500, new { message = "An error occurred while creating the actor", error = ex.Message });
        }
    }
    
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] ActorsPagedRequest request,
        CancellationToken token = default)
    {
        try
        {
            var (actors, totalCount) = await _actorRepository.GetAllPagedAsync(
                request.SortBy, 
                request.SortOrder, 
                request.Page, 
                request.Take, 
                request.Search, 
                token);

            // Убираем дубликаты по ID и имени (case-insensitive)
            var uniqueActors = actors
                .GroupBy(a => a.Name?.Trim().ToLowerInvariant() ?? string.Empty)
                .Select(g => g.First())
                .Select(a => a.MapToResponse())
                .ToList();

            var response = new ActorsResponse
            {
                Items = uniqueActors,
                Page = request.Page,
                PageSize = request.Take,
                TotalCount = totalCount
            };

            _logger.LogInformation("Retrieved {Count} actors (page {Page})", uniqueActors.Count, request.Page);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving actors");
            return StatusCode(500, "An error occurred while retrieving actors");
        }
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken token = default)
    {
        try
        {
            var actor = await _actorRepository.GetByIdAsync(id, token);
            if (actor == null)
            {
                _logger.LogWarning("Actor not found: {Id}", id);
                return NotFound();
            }

            // Получаем фильмы и сериалы с этим актером
            var movies = await _actorRepository.GetMoviesByActorIdAsync(id, token);
            var series = await _actorRepository.GetSeriesByActorIdAsync(id, token);

            var response = new ActorDetailResponse
            {
                Id = actor.Id,
                Name = actor.Name,
                DateOfBirth = actor.DateOfBirth,
                Biography = actor.Biography,
                Movies = movies.Select(m => m.MapToResponse()),
                Series = series.Select(s => s.MapToResponse())
            };

            _logger.LogInformation("Retrieved actor details: {Name} ({Id})", actor.Name, actor.Id);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving actor: {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the actor");
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id, 
        [FromBody] UpdateActorRequest request,
        CancellationToken token = default)
    {
        try
        {
            // Проверяем существование актера
            var existingActor = await _actorRepository.GetByIdAsync(id, token);
            if (existingActor == null)
            {
                return NotFound();
            }

            // Проверка на дубликат имени (исключая текущего актера)
            var allActors = await _actorRepository.GetAllAsync(token);
            if (allActors.Any(a => 
                    a.Id != id && 
                    a.Name.Equals(request.Name.Trim(), StringComparison.OrdinalIgnoreCase)))
            {
                return Conflict($"Actor with name '{request.Name}' already exists");
            }

            var actor = new Actor
            {
                Id = id,
                Name = request.Name.Trim(),
                DateOfBirth = request.DateOfBirth,
                Biography = request.Biography
            };

            var result = await _actorRepository.UpdateAsync(actor, token);
            if (!result)
            {
                _logger.LogWarning("Failed to update actor: {Id}", id);
                return BadRequest("Failed to update actor");
            }

            _logger.LogInformation("Actor updated: {Name} ({Id})", actor.Name, actor.Id);
        
            var response = actor.MapToResponse();
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating actor: {Id}", id);
            return StatusCode(500, "An error occurred while updating the actor");
        }
    }
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken token = default)
    {
        try
        {
            var existingActor = await _actorRepository.GetByIdAsync(id, token);
            if (existingActor == null)
            {
                return NotFound();
            }

            var result = await _actorRepository.DeleteAsync(id, token);
            if (!result)
            {
                _logger.LogWarning("Failed to delete actor: {Id}", id);
                return BadRequest("Failed to delete actor");
            }

            _logger.LogInformation("Actor deleted: {Name} ({Id})", existingActor.Name, id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting actor: {Id}", id);
            return StatusCode(500, "An error occurred while deleting the actor");
        }
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search(
        [FromQuery] string name,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken token = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Search term is required");
            }

            var take = pageSize > 50 ? 50 : pageSize;

            var (actors, totalCount) = await _actorRepository.GetAllPagedAsync(
                "name", "asc", page, take, name, token);

            var results = actors
                .Select(a => a.MapToResponse())
                .ToList();

            var response = new ActorsResponse
            {
                Items = results,
                Page = page,
                PageSize = take,
                TotalCount = totalCount
            };

            _logger.LogInformation("Search for '{Name}' returned {Count} results", name, results.Count);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching actors: {Name}", name);
            return StatusCode(500, "An error occurred while searching actors");
        }
    }
}