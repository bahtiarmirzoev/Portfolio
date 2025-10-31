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

    public AuthService(
        IUserRepository userRepository, 
        ITokenService tokenService, 
        IRoleRepository roleRepository, 
        IRoleService roleService,
        IPasswordResetRepository passwordResetRepository,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _roleRepository = roleRepository;
        _roleService = roleService;
        _passwordResetRepository = passwordResetRepository;
        _emailService = emailService; 
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

    // 🆕 РЕАЛИЗАЦИЯ FORGOT PASSWORD
    public async Task<bool> ForgotPasswordAsync(string email)
    {
        // Находим пользователя по email
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            // Возвращаем true даже если пользователя нет, для безопасности
            return true;
        }

        // Инвалидируем старые токены пользователя
        await _passwordResetRepository.InvalidateUserTokensAsync(user.Id);

        // Создаем новый токен сброса пароля
        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = GenerateResetToken(),
            ExpiresAt = DateTime.UtcNow.AddHours(24) // Токен действует 24 часа
        };

        // Сохраняем токен в базу
        var created = await _passwordResetRepository.CreateAsync(resetToken);
        if (!created)
        {
            return false;
        }

        // Отправляем email с ссылкой для сброса пароля
        await SendPasswordResetEmail(user.Email, resetToken.Token);
        
        return true;
    }

    // 🆕 РЕАЛИЗАЦИЯ RESET PASSWORD
    public async Task<bool> ResetPasswordAsync(string token, string email, string newPassword)
    {
        // Находим токен в базе
        var resetToken = await _passwordResetRepository.GetByTokenAsync(token);
        if (resetToken == null || resetToken.ExpiresAt < DateTime.UtcNow)
        {
            return false; // Токен не найден или просрочен
        }

        // Находим пользователя
        var user = await _userRepository.GetByIdAsync(resetToken.UserId);
        if (user == null || !user.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
        {
            return false; // Пользователь не найден или email не совпадает
        }

        // Проверяем сложность пароля
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
        {
            return false; // Слишком простой пароль
        }

        // Хешируем новый пароль с помощью вашего PasswordHasher
        user.PasswordHash = PasswordHasher.Generate(newPassword);
        
        // Обновляем пользователя в базе
        var updated = await _userRepository.UpdateUserAsync(user);
        if (!updated)
        {
            return false; // Ошибка обновления
        }

        // Помечаем токен как использованный
        await _passwordResetRepository.MarkAsUsedAsync(resetToken.Id);

        // Инвалидируем все refresh токены пользователя (для безопасности)
        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = DateTime.UtcNow;
        await _userRepository.UpdateUserAsync(user);

        // Отправляем email подтверждение смены пароля
        await SendPasswordChangedEmail(user.Email);
        
        return true;
    }

    private static string GenerateResetToken()
    {
        // Генерируем уникальный токен
        return Guid.NewGuid().ToString("N") + "-" + DateTime.UtcNow.Ticks.ToString("x");
    }

    private async Task SendPasswordResetEmail(string email, string token)
    {
        var resetLink = $"http://localhost:3000/reset-password?token={token}&email={email}";
        
        var subject = "Сброс пароля - Movies App";
        var body = $@"
            Сброс пароля

            Вы запросили сброс пароля для вашего аккаунта.

            Для сброса пароля перейдите по ссылке:
            {resetLink}

            Или используйте этот токен: {token}

            Ссылка действительна в течение 24 часов.

            Если вы не запрашивали сброс пароля, проигнорируйте это письмо.";

        try
        {
            await _emailService.SendEmail(email, subject, body);
            Console.WriteLine($"Password reset email sent to: {email}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send password reset email: {ex.Message}");
            throw;
        }
    }

    private async Task SendPasswordChangedEmail(string email)
    {
        var subject = "Пароль изменен - Movies App";
        var body = @"
            Пароль успешно изменен

            Пароль для вашего аккаунта был успешно изменен.

            Если это были не вы, немедленно свяжитесь с поддержкой.";

        try
        {
            await _emailService.SendEmail(email, subject, body);
            Console.WriteLine($"Password changed notification sent to: {email}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send password changed email: {ex.Message}");
            throw;
        }
    }
}
