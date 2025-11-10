using System.ComponentModel.DataAnnotations;

namespace Movies.Contracts.Requests;

public class ChangePasswordRequest
{
    [Required]
    [MinLength(1)]
    public required string CurrentPassword { get; init; }

    [Required]
    [MinLength(8)]
    public required string NewPassword { get; init; }
}

