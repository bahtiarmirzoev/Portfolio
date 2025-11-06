using Movies.Application.Models;

namespace Movies.Application.Services
{
    public interface IOtpService
    {
        Task<OtpResult> GenerateAndSendOtpAsync(Guid userId, string email);
        Task<OtpValidationResult> ValidateOtpAsync(Guid userId, string code);
        Task<bool> ConsumeOtpAsync(Guid otpId);
        Task CleanupExpiredOtpsAsync();
        
        Task<string> DebugOtpCreation(Guid userId, string email);
    }
}