namespace Movies.Contracts.Requests;

public class UpdateActorRequest
{
    public required string Name { get; init; }
    public DateOnly? DateOfBirth { get; init; }
    public string? Biography { get; init; }
}