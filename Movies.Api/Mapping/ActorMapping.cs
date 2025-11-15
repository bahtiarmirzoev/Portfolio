
using Movies.Application.Models;
using Movies.Contracts.Responses;

namespace Movies.Api.Mapping;

public static class ActorMapping
{
    public static ActorResponse MapToResponse(this Actor actor)
    {
        return new ActorResponse
        {
            Id = actor.Id,
            Name = actor.Name,
            DateOfBirth = actor.DateOfBirth,
            Biography = actor.Biography
        };
    }
}