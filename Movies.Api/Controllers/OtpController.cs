using Microsoft.AspNetCore.Mvc;
using Movies.Application.Repositories;
using Movies.Application.Services;
using Microsoft.Extensions.Logging;
using Movies.Application.Models; // ✅ ДОБАВЬ ЭТУ СТРОЧКУ

namespace Movies.Api.Controllers;

[Route("api/otp")]
[ApiController]
public class OtpController : ControllerBase
{
    private readonly IOtpService _otpService;
    private readonly IRoleRepository _roleRepository;
    private readonly IUserRoleRepository _userRoleRepository;
    private readonly IRoleService _roleService;
    private readonly ILogger<OtpController> _logger;

    public OtpController(
        IOtpService otpService,
        IRoleRepository roleRepository, 
        IUserRoleRepository userRoleRepository, 
        IRoleService roleService,
        ILogger<OtpController> logger)
    {
        _otpService = otpService;
        _roleRepository = roleRepository;
        _userRoleRepository = userRoleRepository;
        _roleService = roleService;
        _logger = logger;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        var result = await _otpService.GenerateAndSendOtpAsync(request.UserId, request.Email);
        
        if (result.IsError) // ✅ ИСПОЛЬЗУЕМ IsError ВМЕСТО !
        {
            _logger.LogWarning("Failed to send OTP for user {UserId}: {Error}", request.UserId, result.ErrorMessage);
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(new { message = "OTP sent" });
    }

    [HttpPost("verify")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var validationResult = await _otpService.ValidateOtpAsync(request.UserId, request.Code);
        
        if (validationResult.IsError) // ✅ ИСПОЛЬЗУЕМ IsError ВМЕСТО !
        {
            var errorMessage = validationResult.ErrorType switch
            {
                OtpValidationErrorType.Invalid => "Invalid OTP code",
                OtpValidationErrorType.Expired => "OTP code has expired",
                OtpValidationErrorType.Locked => "Too many failed attempts. Try again later.",
                _ => "Invalid or expired OTP"
            };
            
            _logger.LogWarning("OTP verification failed for user {UserId}: {ErrorType}", request.UserId, validationResult.ErrorType);
            return BadRequest(new { message = errorMessage });
        }

        await _otpService.ConsumeOtpAsync(validationResult.OtpId!.Value);

        var trustedRole = await _roleRepository.GetByNameAsync("trusted_user");
        if (trustedRole is null)
        {
            await _roleRepository.CreateRoleAsync(new Movies.Application.Models.Role { Name = "trusted_user" });
            trustedRole = await _roleRepository.GetByNameAsync("trusted_user");
        }

        if (trustedRole is not null)
            await _roleService.UpgradeToTrustedUserAsync(request.UserId);

        _logger.LogInformation("OTP verified and user {UserId} promoted to trusted_user", request.UserId);
        return Ok(new { message = "OTP verified, user promoted to trusted_user" });
    }

    public record SendOtpRequest(Guid UserId, string Email);
    public record VerifyOtpRequest(Guid UserId, string Code);
    
    [HttpPost("debug-create-otp")]
    public async Task<IActionResult> DebugCreateOtp([FromBody] SendOtpRequest request)
    {
        var debugResult = await _otpService.DebugOtpCreation(request.UserId, request.Email);
        return Ok(new { debug = debugResult });
    }
}