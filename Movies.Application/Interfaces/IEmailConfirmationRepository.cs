public interface IEmailConfirmationRepository
{
    Task CreateAsync(Guid userId, string token, DateTime expiresAt);
    Task<bool> ConfirmAsync(Guid userId, string token);
    Task<bool> ExistsValidTokenAsync(Guid userId, string token);
    Task CreateAsync(EmailConfirmation confirmation);

}