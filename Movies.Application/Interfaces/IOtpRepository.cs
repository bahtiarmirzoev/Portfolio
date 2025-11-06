using Movies.Application.Models;

public interface IOtpRepository
{
    Task<UserOtp?> GetActiveOtpAsync(Guid userId, string code);
    Task<int> GetRecentOtpCountAsync(Guid userId, TimeSpan timeWindow);
    Task AddAsync(UserOtp otp);
    Task UpdateAsync(UserOtp otp);
    Task<bool> MarkAsUsedAsync(Guid otpId);
    Task CleanupExpiredOtpsAsync();
}