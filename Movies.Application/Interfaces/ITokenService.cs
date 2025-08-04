using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Movies.Application.Models;

namespace Movies.Application.Services;

public interface ITokenService
{
    Task<string> Generate(User user);
    string GenerateEmailToken(User user);
    string GenerateRefreshToken();
    Task<TokenValidationResult> Validate(string token, bool lifetime = false);
    Task<ClaimsIdentity> GetClaimsIdentity(string token);
}