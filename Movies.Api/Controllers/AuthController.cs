using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movies.Application.Services;
using Movies.Contracts.Requests;
using Movies.Contracts.Responses;
using Microsoft.Extensions.Logging;
using Movies.Api.Mapping;
using Movies.Application.Interfaces;
using Movies.Application.Models;

namespace Movies.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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