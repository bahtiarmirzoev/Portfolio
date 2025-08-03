using Movies.Application.Models;
using Movies.Contracts.Responses;

namespace Movies.Application.Services;

public interface IAuthService
{
    Task<bool> SignUp(User user);
    Task<TokenData?> SignIn(string username, string password);
    Task<TokenData?> RefreshTokenAsync(string accessToken, string refreshToken);
    Task SignOut(string accessToken, string refreshToken);
}