using System.ComponentModel.DataAnnotations;

namespace Movies.Contracts.Requests;

public record RefreshTokenRequest([Required] string AccessToken, [Required] string RefreshToken);
