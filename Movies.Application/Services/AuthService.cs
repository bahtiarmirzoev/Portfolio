using Movies.Application.Interfaces;
using Movies.Application.Models;
using Movies.Application.Repositories;
using Movies.Contracts.Responses;
using Microsoft.Extensions.Logging; // ✅ ДОБАВЬ ЭТОТ USING

namespace Movies.Application.Services;

public class AuthService : IAuthService
{
    private readonly ITokenService _tokenService;
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IRoleService _roleService;
    private readonly IPasswordResetRepository _passwordResetRepository;
    private readonly IEmailService _emailService;
    private readonly IOtpService _otpService; // ✅ ИЗМЕНИЛ НА ИНТЕРФЕЙС
    private readonly ILogger<AuthService> _logger; // ✅ ДОБАВИЛ ПОЛЕ

    public AuthService(
        IUserRepository userRepository, 
        ITokenService tokenService, 
        IRoleRepository roleRepository, 
        IRoleService roleService,
        IPasswordResetRepository passwordResetRepository,
        IEmailService emailService,
        IOtpService otpService, // ✅ ИЗМЕНИЛ НА ИНТЕРФЕЙС
        ILogger<AuthService> logger) // ✅ ДОБАВИЛ ПАРАМЕТР
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _roleRepository = roleRepository;
        _roleService = roleService;
        _passwordResetRepository = passwordResetRepository;
        _emailService = emailService; 
        _otpService = otpService; // ✅ ИЗМЕНИЛ
        _logger = logger; // ✅ ДОБАВИЛ ИНИЦИАЛИЗАЦИЮ
    }

    public async Task<bool> SignUp(User user)
    {
        var role = await _roleRepository.GetByNameAsync("user");
        if (role == null)
        {
            return false;
        }

        // Нормализуем email: приводим к нижнему регистру и убираем пробелы
        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            user.Email = user.Email.Trim().ToLowerInvariant();
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

    public async Task<ForgotPasswordResult> ForgotPasswordAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            _logger.LogWarning("Forgot password request with empty email");
            return ForgotPasswordResult.Error("Email is required");
        }

        // Нормализуем email из запроса
        var normalizedRequestEmail = email.Trim().ToLowerInvariant();
        
        _logger.LogInformation("🔍 Forgot password request for email: {Email} (normalized: {NormalizedEmail})", 
            email, normalizedRequestEmail);

        // Ищем пользователя по email в базе данных
        var user = await _userRepository.GetByEmailAsync(normalizedRequestEmail);
        if (user == null)
        {
            // 🔐 Security: Не раскрываем существование email
            await Task.Delay(Random.Shared.Next(500, 1500));
            _logger.LogInformation("❌ Forgot password request for non-existent email: {Email}", normalizedRequestEmail);
            return ForgotPasswordResult.SuccessResult();
        }

        // ✅ ВАЖНО: Проверяем, что email пользователя в базе данных совпадает с запрошенным email
        var normalizedUserEmail = user.Email?.Trim().ToLowerInvariant();
        if (normalizedUserEmail != normalizedRequestEmail)
        {
            _logger.LogWarning("⚠️ Email mismatch: Requested={RequestedEmail}, UserEmail={UserEmail}", 
                normalizedRequestEmail, normalizedUserEmail);
            // 🔐 Security: Не раскрываем существование email
            await Task.Delay(Random.Shared.Next(500, 1500));
            return ForgotPasswordResult.SuccessResult();
        }

        _logger.LogInformation("✅ User found: Id={UserId}, Email={UserEmail}", user.Id, user.Email);

        // ✅ Отправляем OTP ТОЛЬКО на email, который зарегистрирован в аккаунте пользователя
        var otpResult = await _otpService.GenerateAndSendOtpAsync(user.Id, user.Email);
        
        if (otpResult.IsError)
        {
            _logger.LogWarning("❌ Failed to generate OTP for user {UserId}: {Error}", user.Id, otpResult.ErrorMessage);
            return ForgotPasswordResult.Error(otpResult.ErrorMessage);
        }

        _logger.LogInformation("✅ OTP sent for password reset to registered email: {Email}", user.Email);
        return ForgotPasswordResult.SuccessResult();
    }

    public async Task<ResetPasswordResult> ResetPasswordAsync(string email, string otpCode, string newPassword)
{
    if (string.IsNullOrWhiteSpace(email))
    {
        _logger.LogWarning("Reset password request with empty email");
        return ResetPasswordResult.InvalidOtp();
    }

    // Нормализуем email из запроса
    var normalizedEmail = email.Trim().ToLowerInvariant();
    
    _logger.LogInformation("🔧 RESET PASSWORD STARTED: Email={Email} (normalized: {NormalizedEmail})", email, normalizedEmail);
    
    // Ищем пользователя по нормализованному email
    var user = await _userRepository.GetByEmailAsync(normalizedEmail);
    if (user == null)
    {
        _logger.LogWarning("❌ User not found for email: {Email}", normalizedEmail);
        return ResetPasswordResult.InvalidOtp();
    }
    
    // ✅ Проверяем, что email пользователя в базе данных совпадает с запрошенным email
    var normalizedUserEmail = user.Email?.Trim().ToLowerInvariant();
    if (normalizedUserEmail != normalizedEmail)
    {
        _logger.LogWarning("⚠️ Email mismatch during reset: Requested={RequestedEmail}, UserEmail={UserEmail}", 
            normalizedEmail, normalizedUserEmail);
        return ResetPasswordResult.InvalidOtp();
    }
    
    _logger.LogInformation("👤 User found: Id={UserId}, Email={Email}", user.Id, user.Email);

    var otpValidation = await _otpService.ValidateOtpAsync(user.Id, otpCode);
    if (otpValidation.IsError)
    {
        _logger.LogWarning("❌ Invalid OTP for user {UserId}", user.Id);
        return ResetPasswordResult.FromOtpValidation(otpValidation);
    }

    _logger.LogInformation("✅ OTP validated successfully");

    await _otpService.ConsumeOtpAsync(otpValidation.OtpId!.Value);

    // Генерируем хеш пароля
    var newPasswordHash = PasswordHasher.Generate(newPassword);
    _logger.LogInformation("🔐 Generated password hash: {PasswordHash}", newPasswordHash);

    // Обновляем пароль в базе
    _logger.LogInformation("💾 Updating password in database for user {UserId}", user.Id);
    var updated = await _userRepository.UpdatePasswordAsync(user.Id, newPasswordHash);
    
    if (!updated)
    {
        _logger.LogError("❌ FAILED to update password for user {UserId}", user.Id);
        return ResetPasswordResult.Error("Failed to update password");
    }

    _logger.LogInformation("✅ Password updated successfully for user {UserId}", user.Id);

    // Проверим что пароль действительно обновился
    var updatedUser = await _userRepository.GetByEmailAsync(normalizedEmail);
    if (updatedUser != null)
    {
        _logger.LogInformation("🔍 Verification: New password hash in DB: {NewHash}", updatedUser.PasswordHash);
        
        // Проверим что новый пароль работает
        var isNewPasswordValid = PasswordHasher.Verify(newPassword, updatedUser.PasswordHash);
        _logger.LogInformation("🔑 New password verification: {IsValid}", isNewPasswordValid);
    }

    await SendPasswordChangedEmail(user.Email);

    _logger.LogInformation("🎉 PASSWORD RESET COMPLETED for {Email}", user.Email);
    return ResetPasswordResult.SuccessResult();
}
    private async Task SendPasswordChangedEmail(string email)
    {
        try
        {
            var subject = "Пароль изменен - Movies App";
            var body = @"
                Пароль успешно изменен

                Пароль для вашего аккаунта был успешно изменен.

                Если это были не вы, немедленно свяжитесь с поддержкой.";

            await _emailService.SendEmail(email, subject, body);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send password changed email to {Email}", email);
        }
    }

    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        return await _userRepository.GetByIdAsync(userId);
    }

    public async Task<ChangePasswordResult> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(newPassword))
        {
            return ChangePasswordResult.Error("Password cannot be empty");
        }

        if (newPassword.Length < 8)
        {
            return ChangePasswordResult.InvalidPassword(new List<string> { "Password must be at least 8 characters long" });
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return ChangePasswordResult.Error("User not found");
        }

        // Проверяем текущий пароль
        var isCurrentPasswordValid = PasswordHasher.Verify(currentPassword, user.PasswordHash);
        if (!isCurrentPasswordValid)
        {
            _logger.LogWarning("Invalid current password for user {UserId}", userId);
            return ChangePasswordResult.InvalidCurrentPassword();
        }

        // Генерируем новый хеш пароля
        var newPasswordHash = PasswordHasher.Generate(newPassword);
        
        // Обновляем пароль
        var updated = await _userRepository.UpdatePasswordAsync(userId, newPasswordHash);
        if (!updated)
        {
            _logger.LogError("Failed to update password for user {UserId}", userId);
            return ChangePasswordResult.Error("Failed to update password");
        }

        _logger.LogInformation("Password changed successfully for user {UserId}", userId);
        return ChangePasswordResult.SuccessResult();
    }
}