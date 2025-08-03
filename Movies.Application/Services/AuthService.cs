using Movies.Application.Models;
using Movies.Application.Repositories;
using Movies.Contracts.Responses;

namespace Movies.Application.Services;

public class AuthService : IAuthService
{
    private readonly ITokenService _tokenService;
    private readonly IUserRepository _userRepository;

    public AuthService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<bool> SignUp(User user)
    {
        return await _userRepository.CreateUserAsync(user);
    }

    public async Task<TokenData?> SignIn(
        string username,
        string password
    )
    {
        var user = await _userRepository.GetByUsernameAsync(username);

        if (user is null)
        {
            return null;
        }

        var isPasswordValid = PasswordHasher.Verify(password, user.PasswordHash);

        if (!isPasswordValid)
        {
            return null;
        }

        var accessToken = await _tokenService.Generate(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpires = DateTime.UtcNow.AddDays(1);

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = refreshTokenExpires;

        await _userRepository.UpdateUserAsync(user);

        return new TokenData(
            accessToken,
            refreshToken,
            refreshTokenExpires
        );
    }

    public async Task<TokenData?> RefreshTokenAsync(
        string accessToken, string refreshToken
    )
    {
        ArgumentNullException.ThrowIfNull(accessToken);
        ArgumentNullException.ThrowIfNull(refreshToken);

        var principal = await _tokenService.GetClaimsIdentity(accessToken);

        var userId = principal.Claims.FirstOrDefault(c => c.Type == "userId")!.Value;
        var user = await _userRepository.GetByIdAsync(new Guid(userId));
        
        ArgumentNullException.ThrowIfNull(user);

        if (
            user.RefreshToken != refreshToken
            || user.RefreshTokenExpiryTime < DateTime.UtcNow
        )
        {
            return null;
        }

        var newAccessToken = await _tokenService.Generate(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var expiryTime = DateTime.UtcNow.AddDays(1);

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = expiryTime;

        await _userRepository.UpdateUserAsync(user);

        return new TokenData(
            newAccessToken,
            newRefreshToken,
            expiryTime
        );
    }

    public async Task SignOut(string accessToken, string refreshToken)
    {
        var claimsIdentity = await _tokenService.GetClaimsIdentity(accessToken);
        var userId = new Guid(claimsIdentity.Claims.First(c => c.Type == "userId").Value);

        var user = await _userRepository.GetByIdAsync(userId);

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = DateTime.Now;

        await _userRepository.UpdateUserAsync(user);
    }
}