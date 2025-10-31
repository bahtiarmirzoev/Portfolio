using Dapper;
using Movies.Application.Database;
using Movies.Application.Interfaces;
using Movies.Application.Models;

namespace Movies.Application.Repositories;

public class PasswordResetRepository : IPasswordResetRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PasswordResetRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PasswordResetToken?> GetByTokenAsync(string token)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        return await connection.QuerySingleOrDefaultAsync<PasswordResetToken>(
            "SELECT * FROM password_reset_tokens WHERE token = @Token AND used = false AND expires_at > @Now",
            new { Token = token, Now = DateTime.UtcNow });
    }

    public async Task<PasswordResetToken?> GetActiveByUserIdAsync(Guid userId)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        return await connection.QuerySingleOrDefaultAsync<PasswordResetToken>(
            "SELECT * FROM password_reset_tokens WHERE userid = @UserId AND used = false AND expires_at > @Now ORDER BY created_at DESC LIMIT 1",
            new { UserId = userId, Now = DateTime.UtcNow });
    }

    public async Task<bool> CreateAsync(PasswordResetToken token)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        var result = await connection.ExecuteAsync(
            "INSERT INTO password_reset_tokens (id, userid, token, expires_at) VALUES (@Id, @UserId, @Token, @ExpiresAt)",
            token);
            
        return result > 0;
    }

    public async Task<bool> MarkAsUsedAsync(Guid tokenId)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        var result = await connection.ExecuteAsync(
            "UPDATE password_reset_tokens SET used = true WHERE id = @Id",
            new { Id = tokenId });
            
        return result > 0;
    }

    public async Task<bool> InvalidateUserTokensAsync(Guid userId)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        var result = await connection.ExecuteAsync(
            "UPDATE password_reset_tokens SET used = true WHERE userid = @UserId AND used = false",
            new { UserId = userId });
            
        return result > 0;
    }
}