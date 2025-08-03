using System.ComponentModel.DataAnnotations;

namespace Movies.Contracts.Requests;

public record SignInRequest([Required] string Username, [Required] string Password);
