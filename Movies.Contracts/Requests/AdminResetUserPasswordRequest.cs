using System.ComponentModel.DataAnnotations;

namespace Movies.Contracts.Requests;

public class AdminResetUserPasswordRequest
{
    [Required]
    public required Guid UserId { get; init; }

    [Required]
    [MinLength(8)]
    public required string NewPassword { get; init; }
}

