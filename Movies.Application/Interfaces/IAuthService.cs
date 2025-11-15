// Movies.Application/Interfaces/IAuthService.cs
using Movies.Application.Models;
using Movies.Contracts.Responses;

namespace Movies.Application.Interfaces
{
    public interface IAuthService
    {
        Task<bool> SignUp(User user);
        Task<TokenData?> SignIn(string username, string password);
        Task<TokenData?> RefreshTokenAsync(string accessToken, string refreshToken);
        Task SignOut(string accessToken, string refreshToken);
        Task<ForgotPasswordResult> ForgotPasswordAsync(string email);
        Task<ResetPasswordResult> ResetPasswordAsync(string email, string otpCode, string newPassword);
        Task<User?> GetUserByIdAsync(Guid userId);
        Task<ChangePasswordResult> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
        Task<bool> AdminResetUserPasswordAsync(Guid userId, string newPassword);
    }
}