using System.ComponentModel.DataAnnotations;

namespace Movies.Contracts.Requests;

public record CreateUserRequest(
    [Required] string Username,
    [Required] string Password,
    [Required] string ConfirmPassword,
    [Required] string Email,
    string FirstName,
    string LastName
);