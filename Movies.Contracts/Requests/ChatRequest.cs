namespace Movies.Contracts.Requests;

public class ChatRequest
{
    public required string Message { get; init; }
    public string? Preferences { get; init; }
}

