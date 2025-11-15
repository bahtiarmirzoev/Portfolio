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
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new ErrorResponse("Invalid request data", errors));
            }

            // Проверяем совпадение паролей
            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest(new ErrorResponse("Passwords do not match"));
            }

            // Проверяем минимальную длину пароля
            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            {
                return BadRequest(new ErrorResponse("Password must be at least 8 characters long"));
            }

            try
            {
                var user = request.MapToUser();
                var success = await _authService.SignUp(user);
                
                if (!success)
                {
                    return BadRequest(new ErrorResponse("Registration failed. Username or email may already exist."));
                }

                return Ok(new MessageResponse("User registered successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, new ErrorResponse("An error occurred during registration"));
            }
        }

        [HttpPost("sign-in")]
        public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse("Invalid request data"));
            }

            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new ErrorResponse("Username and password are required"));
            }

            try
            {
            var tokenData = await _authService.SignIn(request.Username, request.Password);
                if (tokenData is null)
                {
                    _logger.LogWarning("Failed login attempt for username: {Username}", request.Username);
                    return BadRequest(new ErrorResponse("Invalid username or password"));
                }

                _logger.LogInformation("Successful login for username: {Username}", request.Username);
            return Ok(tokenData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during sign in");
                return StatusCode(500, new ErrorResponse("An error occurred during sign in"));
            }
        }

        [HttpPost("token/refresh")]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequest tokens)
        {
            if (string.IsNullOrWhiteSpace(tokens.AccessToken) || string.IsNullOrWhiteSpace(tokens.RefreshToken))
            {
                return BadRequest(new ErrorResponse("Access token and refresh token are required"));
            }

            try
            {
            var tokenData = await _authService.RefreshTokenAsync(tokens.AccessToken, tokens.RefreshToken);
                if (tokenData is null)
                {
                    _logger.LogWarning("Failed to refresh token");
                    return BadRequest(new ErrorResponse("Invalid or expired refresh token"));
                }

            return Ok(tokenData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return StatusCode(500, new ErrorResponse("An error occurred during token refresh"));
            }
        }

        [HttpPost("sign-out")]
        public new async Task<IActionResult> SignOut(SignOutRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.AccessToken))
            {
                return BadRequest(new ErrorResponse("Access token is required"));
            }

            try
            {
            await _authService.SignOut(request.AccessToken, request.RefreshToken);
            return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during sign out");
                // Все равно возвращаем успех, так как выход должен быть идемпотентным
                return NoContent();
            }
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

        [HttpPost("admin/reset-user-password")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AdminResetUserPassword([FromBody] AdminResetUserPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse("Invalid request data"));
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
            {
                return BadRequest(new ErrorResponse("Password must be at least 8 characters long"));
            }

            try
            {
                var success = await _authService.AdminResetUserPasswordAsync(request.UserId, request.NewPassword);
                if (!success)
                {
                    return BadRequest(new ErrorResponse("Failed to reset user password"));
                }

                _logger.LogInformation("Admin reset password for user {UserId}", request.UserId);
                return Ok(new MessageResponse("User password has been reset successfully."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during admin password reset");
                return StatusCode(500, new ErrorResponse("An error occurred during password reset"));
            }
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