namespace Movies.Contracts.Requests;

public class ResetPasswordRequest
{
    public required string OtpCode { get; init; }
    public required string Email { get; init; }
    public required string NewPassword { get; init; }
}