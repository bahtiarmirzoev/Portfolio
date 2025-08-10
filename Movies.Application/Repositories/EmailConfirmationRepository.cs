using Dapper;
using Movies.Application.Database;

namespace Movies.Application.Repositories;

public class EmailConfirmationRepository : IEmailConfirmationRepository
{
    private readonly IDbConnectionFactory _dbConnectionFactory;
    private IEmailConfirmationRepository _emailConfirmationRepositoryImplementation;

    public EmailConfirmationRepository(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task CreateAsync(Guid userId, string token, DateTime expiresAt)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        await connection.ExecuteAsync("""
                                          insert into email_confirmations (userId, token, expiresAt, confirmed)
                                          values (@userId, @token, @expiresAt, false)
                                      """, new { userId, token, expiresAt });
    }

    public async Task<bool> ConfirmAsync(Guid userId, string token)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        var rows = await connection.ExecuteAsync("""
                                                     update email_confirmations
                                                     set confirmed = true
                                                     where userId = @userId
                                                       and token = @token
                                                       and expiresAt > now()
                                                       and confirmed = false
                                                 """, new { userId, token });
        return rows > 0;
    }

    public async Task<bool> ExistsValidTokenAsync(Guid userId, string token)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        return await connection.ExecuteScalarAsync<bool>("""
                                                             select count(1)
                                                             from email_confirmations
                                                             where userId = @userId
                                                               and token = @token
                                                               and expiresAt > now()
                                                               and confirmed = false
                                                         """, new { userId, token });
    }

    public Task CreateAsync(EmailConfirmation confirmation)
    {
        return _emailConfirmationRepositoryImplementation.CreateAsync(confirmation);
    }
}