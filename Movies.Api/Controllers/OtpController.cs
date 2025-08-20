using Microsoft.AspNetCore.Mvc;
using Movies.Application.Repositories;
using Movies.Application.Services;

namespace Movies.Api.Controllers;

[Route("api/otp")]
[ApiController]
public class OtpController : ControllerBase
{
    private readonly OtpService _otpService;
    private readonly IRoleRepository _roleRepository;
    private readonly IUserRoleRepository _userRoleRepository;
    private readonly IRoleService _roleService;

    public OtpController(OtpService otpService, IRoleRepository roleRepository, IUserRoleRepository userRoleRepository, IRoleService roleService)
    {
        _otpService = otpService;
        _roleRepository = roleRepository;
        _userRoleRepository = userRoleRepository;
        _roleService = roleService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        await _otpService.GenerateAndSendOtp(request.UserId, request.Email);
        return Ok(new { message = "OTP sent" });
    }

    [HttpPost("verify")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var valid = await _otpService.VerifyOtp(request.UserId, request.Code);
        if (!valid) return BadRequest(new { message = "Invalid or expired OTP" });

        var trustedRole = await _roleRepository.GetByNameAsync("trusted_user");
        if (trustedRole is null)
        {
            await _roleRepository.CreateRoleAsync(new Movies.Application.Models.Role { Name = "trusted_user" });
            trustedRole = await _roleRepository.GetByNameAsync("trusted_user");
        }

        if (trustedRole is not null)
            await _roleService.UpgradeToTrustedUserAsync(request.UserId);

        return Ok(new { message = "OTP verified, user promoted to trusted_user" });
    }

    public record SendOtpRequest(Guid UserId, string Email);
    public record VerifyOtpRequest(Guid UserId, string Code);
}