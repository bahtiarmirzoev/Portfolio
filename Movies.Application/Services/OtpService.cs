using Movies.Application.Repositories;
using Movies.Application.Models;
using Movies.Application.Services;
using System;
using System.Threading.Tasks;

namespace Movies.Application.Services
{
    public class OtpService
    {
        private readonly OtpRepository _otpRepository;

        public OtpService(OtpRepository otpRepository)
        {
            _otpRepository = otpRepository;
        }

        public async Task GenerateAndSendOtp(Guid userId, string email)
        {
            var otpCode = new Random().Next(100000, 999999).ToString();

            var otp = new UserOtp
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Code = otpCode
            };

            await _otpRepository.AddOtpAsync(otp);

            // TODO: интеграция с email сервисом
            Console.WriteLine($"OTP for {email}: {otpCode}");
        }

        public async Task<bool> VerifyOtp(Guid userId, string code)
        {
            var otp = await _otpRepository.GetOtpAsync(userId, code);
            return otp != null;
        }
    }
}