using System.ComponentModel.DataAnnotations;

namespace Movies.Contracts.Requests;

public record SignOutRequest([Required] string AccessToken, [Required] string RefreshToken);
