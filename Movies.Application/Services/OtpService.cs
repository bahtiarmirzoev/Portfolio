using Movies.Application.Repositories;
using Movies.Application.Models;
using Movies.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace Movies.Application.Services
{
    public class OtpService
    {
        private readonly OtpRepository _otpRepository;
        private readonly IEmailService _emailService;

        public OtpService(OtpRepository otpRepository, IEmailService emailService)
        {
            _otpRepository = otpRepository;
            _emailService = emailService;
        }

        public async Task GenerateAndSendOtp(Guid userId, string email)
        {
            var otpCode = new Random().Next(100000, 999999).ToString();

            var otp = new UserOtp
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Code = otpCode,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                CreatedAt = DateTime.UtcNow
            };

            await _otpRepository.AddOtpAsync(otp);

            var subject = "Ваш OTP код для входа";
            var body = $"Здравствуйте!\n\nВаш OTP-код: {otpCode}\nОн действует 5 минут.";

            try
            {
                await _emailService.SendEmail(email, subject, body);
                Console.WriteLine($"✅ OTP {otpCode} отправлен на {email}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Ошибка при отправке OTP: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> VerifyOtp(Guid userId, string code)
        {
            var otp = await _otpRepository.GetOtpAsync(userId, code);

            if (otp is null)
                return false;

            // ✅ Проверяем срок действия
            if (DateTime.UtcNow > otp.ExpiresAt)
                return false;

            return true;
        }
    }
}