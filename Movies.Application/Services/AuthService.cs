using Movies.Application.Interfaces;
using Movies.Application.Models;
using Movies.Application.Repositories;
using Movies.Contracts.Responses;

namespace Movies.Application.Services;

public class AuthService : IAuthService
{
    private readonly ITokenService _tokenService;
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IRoleService _roleService;
    private readonly IPasswordResetRepository _passwordResetRepository;
    private readonly IEmailService _emailService;
    private readonly OtpService _otpService;

    public AuthService(
        IUserRepository userRepository, 
        ITokenService tokenService, 
        IRoleRepository roleRepository, 
        IRoleService roleService,
        IPasswordResetRepository passwordResetRepository,
        IEmailService emailService,
        OtpService otpService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _roleRepository = roleRepository;
        _roleService = roleService;
        _passwordResetRepository = passwordResetRepository;
        _emailService = emailService; 
        _otpService = otpService;
    }

    public async Task<bool> SignUp(User user)
    {
        var role = await _roleRepository.GetByNameAsync("user");
        if (role == null)
        {
            return false;
        }

        // Хешируем пароль перед сохранением пользователя
        user.PasswordHash = PasswordHasher.Generate(user.PasswordHash);

        // 1. Создаём пользователя
        var result = await _userRepository.CreateUserAsync(user);
        if (!result)
        {
            return false;
        }

        // 2. Выдаём роль
        await _roleService.AssignRoleToUserAsync(user.Id, role.Name);

        return true;
    }

    public async Task<TokenData?> SignIn(
        string username,
        string password
    )
    {
        var user = await _userRepository.GetByUsernameAsync(username);

        if (user is null)
        {
            return null;
        }

        // Используем ваш PasswordHasher для проверки пароля
        var isPasswordValid = PasswordHasher.Verify(password, user.PasswordHash);

        if (!isPasswordValid)
        {
            return null;
        }

        var accessToken = await _tokenService.Generate(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpires = DateTime.UtcNow.AddDays(1);

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = refreshTokenExpires;

        await _userRepository.UpdateUserAsync(user);

        return new TokenData(
            accessToken,
            refreshToken,
            refreshTokenExpires
        );
    }

    public async Task<TokenData?> RefreshTokenAsync(
        string accessToken, string refreshToken
    )
    {
        ArgumentNullException.ThrowIfNull(accessToken);
        ArgumentNullException.ThrowIfNull(refreshToken);

        var principal = await _tokenService.GetClaimsIdentity(accessToken);

        var userId = principal.Claims.FirstOrDefault(c => c.Type == "userId")!.Value;
        var user = await _userRepository.GetByIdAsync(new Guid(userId));
        
        ArgumentNullException.ThrowIfNull(user);

        if (
            user.RefreshToken != refreshToken
            || user.RefreshTokenExpiryTime < DateTime.UtcNow
        )
        {
            return null;
        }

        var newAccessToken = await _tokenService.Generate(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var expiryTime = DateTime.UtcNow.AddDays(1);

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = expiryTime;

        await _userRepository.UpdateUserAsync(user);

        return new TokenData(
            newAccessToken,
            newRefreshToken,
            expiryTime
        );
    }

    public async Task SignOut(string accessToken, string refreshToken)
    {
        var claimsIdentity = await _tokenService.GetClaimsIdentity(accessToken);
        var userId = new Guid(claimsIdentity.Claims.First(c => c.Type == "userId").Value);

        var user = await _userRepository.GetByIdAsync(userId);

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = DateTime.UtcNow;

        await _userRepository.UpdateUserAsync(user);
    }

   public async Task<bool> ForgotPasswordAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            // Возвращаем true даже если пользователя нет — чтобы не раскрывать наличие email
            return true;
        }

        // Генерируем и отправляем OTP через твой сервис
        await _otpService.GenerateAndSendOtp(user.Id, user.Email);

        Console.WriteLine($"✅ OTP sent for password reset to {user.Email}");
        return true;
    }

    // 🔹 Reset Password — теперь проверяет OTP вместо токена
    public async Task<bool> ResetPasswordAsync(string email, string otpCode, string newPassword)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
            return false;

        // Проверяем OTP-код
        var isValidOtp = await _otpService.VerifyAndConsumeOtp(user.Id, otpCode);
        if (!isValidOtp)
            return false;

        // Проверка сложности пароля
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            return false;

        // Обновляем пароль
        user.PasswordHash = PasswordHasher.Generate(newPassword);
        var updated = await _userRepository.UpdateUserAsync(user);
        if (!updated)
            return false;

        // Инвалидируем refresh токен (если используешь)
        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = DateTime.UtcNow;
        await _userRepository.UpdateUserAsync(user);

        // Отправляем уведомление об изменении пароля
        await SendPasswordChangedEmail(user.Email);

        Console.WriteLine($"✅ Password successfully changed for {user.Email}");
        return true;
    }

    private async Task SendPasswordChangedEmail(string email)
    {
        var subject = "Пароль изменен - Movies App";
        var body = @"
            Пароль успешно изменен

            Пароль для вашего аккаунта был успешно изменен.

            Если это были не вы, немедленно свяжитесь с поддержкой.";

        await _emailService.SendEmail(email, subject, body);
    }
}
