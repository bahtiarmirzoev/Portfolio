namespace Movies.Contracts.Requests;

public class ForgotPasswordRequest
{
    public required string Email { get; init; }
}