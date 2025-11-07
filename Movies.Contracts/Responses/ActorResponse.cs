namespace Movies.Contracts.Responses;

public class ActorResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public DateOnly? DateOfBirth { get; init; }
    public string? Biography { get; init; }
}