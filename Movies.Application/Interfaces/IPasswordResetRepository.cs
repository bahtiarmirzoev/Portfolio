using Movies.Application.Models;

namespace Movies.Application.Interfaces;

public interface IPasswordResetRepository
{
    Task<PasswordResetToken?> GetByTokenAsync(string token);
    Task<PasswordResetToken?> GetActiveByUserIdAsync(Guid userId);
    Task<bool> CreateAsync(PasswordResetToken token);
    Task<bool> MarkAsUsedAsync(Guid tokenId);
    Task<bool> InvalidateUserTokensAsync(Guid userId);   
}