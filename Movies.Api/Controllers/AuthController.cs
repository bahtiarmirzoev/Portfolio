using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Services;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;
using Microsoft.Extensions.Logging;
using Movies.Api.Mapping;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using System.Security.Claims;

namespace Movies.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid forgot password request model");
                return BadRequest(new ErrorResponse("Invalid request data"));
            }

            var result = await _authService.ForgotPasswordAsync(request.Email);

            if (result.IsError)
            {
                _logger.LogWarning("Forgot password failed for {Email}: {Error}", request.Email, result.ErrorMessage);
                
                // 🔐 Security: Всегда возвращаем одинаковый ответ
                return Ok(new MessageResponse("If the email exists, an OTP code has been sent."));
            }

            _logger.LogInformation("Forgot password request processed for {Email}", request.Email);
            return Ok(new MessageResponse("If the email exists, an OTP code has been sent."));
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                    
                _logger.LogWarning("Invalid reset password request: {Errors}", string.Join(", ", errors));
                return BadRequest(new ErrorResponse("Invalid request data", errors));
            }

            var result = await _authService.ResetPasswordAsync(
                request.Email, 
                request.OtpCode, 
                request.NewPassword
            );

            if (result.IsError)
            {
                return HandleResetPasswordError(result);
            }

            _logger.LogInformation("Password reset successfully for {Email}", request.Email);
            return Ok(new MessageResponse("Password has been reset successfully."));
        }

        private IActionResult HandleResetPasswordError(ResetPasswordResult result)
        {
            var errorMessage = result.ErrorType switch
            {
                ResetPasswordErrorType.InvalidOtp => "Invalid or expired OTP code.",
                ResetPasswordErrorType.ExpiredOtp => "OTP code has expired.",
                ResetPasswordErrorType.Locked => $"Too many failed attempts. Try again after {result.LockedUntil?.ToString("HH:mm")} UTC.",
                ResetPasswordErrorType.InvalidPassword => "Password does not meet security requirements.",
                _ => result.ErrorMessage ?? "An error occurred."
            };

            var response = result.ErrorType == ResetPasswordErrorType.InvalidPassword
                ? new ErrorResponse(errorMessage, result.PasswordErrors)
                : new ErrorResponse(errorMessage);

            _logger.LogWarning("Reset password failed: {ErrorType} - {ErrorMessage}", result.ErrorType, errorMessage);
            
            return BadRequest(response);
        }

        // ... остальные методы контроллера (SignUp, SignIn, RefreshToken, SignOut)
        [HttpPost("sign-up")]
        public async Task<IActionResult> SignUp([FromBody] CreateUserRequest request)
        {
            // Твоя существующая реализация
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _authService.SignUp(request.MapToUser());
            return Created(nameof(SignUp), response);
        }

        [HttpPost("sign-in")]
        public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
        {
            // Твоя существующая реализация
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var tokenData = await _authService.SignIn(request.Username, request.Password);
            if (tokenData is null) return BadRequest("Invalid username or password");

            return Ok(tokenData);
        }

        [HttpPost("token/refresh")]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequest tokens)
        {
            // Твоя существующая реализация
            var tokenData = await _authService.RefreshTokenAsync(tokens.AccessToken, tokens.RefreshToken);
            if (tokenData is null) return BadRequest();
            return Ok(tokenData);
        }

        [HttpPost("sign-out")]
        public new async Task<IActionResult> SignOut(SignOutRequest request)
        {
            // Твоя существующая реализация
            await _authService.SignOut(request.AccessToken, request.RefreshToken);
            return NoContent();
        }

        [HttpGet("check")]
        [Authorize]
        public IActionResult Check()
        {
            return Ok("Token is valid ✅");
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    _logger.LogWarning("User ID claim not found in token");
                    return Unauthorized(new { error = "User ID not found in token" });
                }

                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("User not found for ID: {UserId}", userId);
                    return NotFound(new { error = "User not found" });
                }

                return Ok(new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    isEmailConfirmed = user.IsEmailConfirmed
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse("Invalid request data"));
            }

            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized();
            }

            var result = await _authService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
            
            if (result.IsError)
            {
                return BadRequest(new ErrorResponse(result.ErrorMessage ?? "Failed to change password"));
            }

            return Ok(new MessageResponse("Password changed successfully."));
        }
    }

    public class MessageResponse
    {
        public string Message { get; set; }

        public MessageResponse(string message)
        {
            Message = message;
        }
    }

    public class ErrorResponse
    {
        public string Error { get; set; }
        public List<string>? Details { get; set; }

        public ErrorResponse(string error)
        {
            Error = error;
        }

        public ErrorResponse(string error, List<string>? details)
        {
            Error = error;
            Details = details;
        }
        
    }
}