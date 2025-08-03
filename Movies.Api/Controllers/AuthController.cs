using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Api.Mapping;
using Movies.Application.Services;
using Movies.Contracts.Requests;

namespace Movies.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IAuthService identityService
) : ControllerBase
{
    [HttpPost("token/refresh")]
    public async Task<IActionResult> RefreshToken(RefreshTokenRequest tokens)
    {
        var tokenData = await identityService.RefreshTokenAsync(tokens.AccessToken, tokens.RefreshToken);

        if (tokenData is null) return BadRequest();

        return Ok(tokenData);
    }

    [HttpPost("sign-up")]
    public async Task<IActionResult> SignUp([FromBody] CreateUserRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var response = await identityService.SignUp(request.MapToUser());

        return Created(nameof(SignUp), response);
    }

    [HttpPost("sign-in")]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var tokenData = await identityService.SignIn(
            request.Username,
            request.Password
        );

        if (tokenData is null) return BadRequest("Invalid username or password");

        return Ok(tokenData);
    }

    [HttpPost("sign-out")]
    public new async Task<IActionResult> SignOut(SignOutRequest request)
    {
        await identityService.SignOut(request.AccessToken, request.RefreshToken);

        return NoContent();
    }

    [HttpGet("check")]
    [Authorize]
    public IActionResult Check()
    {
        return Ok("This works");
    }
}