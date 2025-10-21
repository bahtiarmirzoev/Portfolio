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
                
            };

            await _otpRepository.AddOtpAsync(otp);

            // ✅ Отправляем письмо через EmailService
            var subject = "Ваш OTP код для входа";
            var body = $"Здравствуйте!\n\nВаш OTP-код для подтверждения: {otpCode}\n\nОн действует 5 минут.";

            try
            {
                await _emailService.SendEmail(email, subject, body);
                Console.WriteLine($"✅ OTP {otpCode} успешно отправлен на {email}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Ошибка при отправке OTP: {ex.Message}");
                throw; // важно не глушить исключение
            }
        }

        public async Task<bool> VerifyOtp(Guid userId, string code)
        {
            var otp = await _otpRepository.GetOtpAsync(userId, code);
            return otp != null;
        }
    }
}