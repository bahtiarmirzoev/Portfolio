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

        if (tokenData is null) 
            return BadRequest("Invalid username or password");

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
        return Ok("Token is valid ✅");
    }

    // 🔹 Отправка OTP-кода для сброса пароля
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await identityService.ForgotPasswordAsync(request.Email);

        // Независимо от результата возвращаем Ok для безопасности
        return Ok(new { message = "If the email exists, an OTP code has been sent." });
    }

    // 🔹 Проверка OTP и смена пароля
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await identityService.ResetPasswordAsync(
            request.Email,
            request.OtpCode, // заменили Token → OtpCode
            request.NewPassword
        );

        if (!result)
            return BadRequest("Invalid or expired OTP code.");

        return Ok(new { message = "Password has been reset successfully." });
    }
}
