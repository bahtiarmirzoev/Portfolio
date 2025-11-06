using Microsoft.Extensions.Logging;
using Movies.Application.Interfaces;
using Movies.Application.Models;
using Movies.Application.Repositories;

namespace Movies.Application.Services
{
    public class OtpService : IOtpService
    {
        private readonly IOtpRepository _otpRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<OtpService> _logger;

        public OtpService(IOtpRepository otpRepository, IEmailService emailService, ILogger<OtpService> logger)
        {
            _otpRepository = otpRepository;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<OtpResult> GenerateAndSendOtpAsync(Guid userId, string email)
{
    try
    {
        var recentAttempts = await _otpRepository.GetRecentOtpCountAsync(userId, TimeSpan.FromMinutes(10));
        if (recentAttempts >= 3)
        {
            return OtpResult.TooManyRequests();
        }

        var otpCode = GenerateSecureOtp();
        
        var otp = new UserOtp
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Code = otpCode,
            ExpiresAt = DateTime.UtcNow.AddHours(24), 
            CreatedAt = DateTime.UtcNow, 
            Used = false,
            Attempts = 0
        };

        _logger.LogInformation("📝 Creating OTP: Code={Code}, ExpiresAt={ExpiresAt} (UTC), Now={Now} (UTC)", 
            otpCode, otp.ExpiresAt, DateTime.UtcNow);

        await _otpRepository.AddAsync(otp);
        await SendOtpEmail(email, otpCode);

        _logger.LogInformation("✅ OTP sent for user {UserId}", userId);
        return OtpResult.SuccessResult();
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "❌ Failed to generate OTP for user {UserId}", userId);
        return OtpResult.Error("Failed to generate OTP");
    }
}

public async Task<OtpValidationResult> ValidateOtpAsync(Guid userId, string code)
{
    _logger.LogInformation("🔍 Validating OTP for user {UserId}, code: {Code}", userId, code);
    
    var otp = await _otpRepository.GetActiveOtpAsync(userId, code);
    
    if (otp == null)
    {
        _logger.LogWarning("❌ OTP not found for user {UserId}", userId);
        return OtpValidationResult.Invalid();
    }
    
    var nowUtc = DateTime.UtcNow; // ✅ ИСПОЛЬЗУЕМ UTC ДЛЯ ПРОВЕРКИ
    _logger.LogInformation("📅 OTP found: CreatedAt={CreatedAt} (UTC), ExpiresAt={ExpiresAt} (UTC), Now={Now} (UTC), Used={Used}", 
        otp.CreatedAt, otp.ExpiresAt, nowUtc, otp.Used);
    
    // 🔐 Проверяем блокировку
    if (otp.LockedUntil.HasValue && otp.LockedUntil > nowUtc)
    {
        _logger.LogWarning("🔒 OTP locked until {LockedUntil}", otp.LockedUntil);
        return OtpValidationResult.Locked(otp.LockedUntil.Value);
    }
    
    // 🔐 Проверяем срок действия (ИСПОЛЬЗУЕМ UTC)
    if (otp.ExpiresAt < nowUtc)
    {
        _logger.LogWarning("⏰ OTP EXPIRED: ExpiresAt={ExpiresAt} (UTC), Now={Now} (UTC), Difference={Difference} minutes", 
            otp.ExpiresAt, nowUtc, (nowUtc - otp.ExpiresAt).TotalMinutes);
        return OtpValidationResult.Expired();
    }
    
    // 🔐 Проверяем код
    if (otp.Code != code)
    {
        _logger.LogWarning("❌ OTP code mismatch: Expected={Expected}, Received={Received}", otp.Code, code);
        otp.Attempts++;
        
        if (otp.Attempts >= 3)
        {
            otp.LockedUntil = DateTime.UtcNow.AddMinutes(15); // ✅ UTC
            _logger.LogWarning("🔒 OTP locked due to too many attempts: {Attempts} attempts", otp.Attempts);
        }
        
        await _otpRepository.UpdateAsync(otp);
        return OtpValidationResult.Invalid();
    }

    _logger.LogInformation("✅ OTP validated successfully for user {UserId}", userId);
    return OtpValidationResult.Valid(otp.Id);
}
        public async Task<bool> ConsumeOtpAsync(Guid otpId)
        {
            return await _otpRepository.MarkAsUsedAsync(otpId);
        }

        private static string GenerateSecureOtp()
        {
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            var number = BitConverter.ToUInt32(bytes, 0) % 1000000;
            return number.ToString("D6");
        }

        private async Task SendOtpEmail(string email, string otpCode)
        {
            var subject = "Код для восстановления пароля";
            var body = $"""
                Здравствуйте!
                
                Ваш код для восстановления пароля: {otpCode}
                
                Код действителен в течение 10 минут.
                """;

            await _emailService.SendEmail(email, subject, body);
        }

        public async Task CleanupExpiredOtpsAsync()
        {
            await _otpRepository.CleanupExpiredOtpsAsync();
        }
        
        public async Task<string> DebugOtpCreation(Guid userId, string email)
        {
            try
            {
                var otpCode = GenerateSecureOtp();
                var createdAt = DateTime.UtcNow;
                var expiresAt = createdAt.AddMinutes(10);
        
                _logger.LogInformation("🛠️ DEBUG OTP CREATION:");
                _logger.LogInformation("   Code: {Code}", otpCode);
                _logger.LogInformation("   CreatedAt (UTC): {CreatedAt}", createdAt);
                _logger.LogInformation("   ExpiresAt (UTC): {ExpiresAt}", expiresAt);
                _logger.LogInformation("   Now (UTC): {Now}", DateTime.UtcNow);

                var otp = new UserOtp
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Code = otpCode,
                    ExpiresAt = expiresAt,
                    CreatedAt = createdAt,
                    Used = false,
                    Attempts = 0
                };

                await _otpRepository.AddAsync(otp);
        
                // Проверим что сохранилось в базе
                var savedOtp = await _otpRepository.GetActiveOtpAsync(userId, otpCode);
                if (savedOtp != null)
                {
                    return $"✅ OTP создан: Code={savedOtp.Code}, CreatedAt={savedOtp.CreatedAt}, ExpiresAt={savedOtp.ExpiresAt}";
                }
        
                return "❌ OTP не найден после сохранения";
            }
            catch (Exception ex)
            {
                return $"❌ Ошибка: {ex.Message}";
            }
        }
    }
}