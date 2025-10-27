namespace Movies.Contracts.Requests;

public class CreateActorRequest
{
    public required string Name { get; init; }
    public DateOnly? DateOfBirth { get; init; }
    public string? Biography { get; init; }
}