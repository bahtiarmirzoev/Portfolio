using Movies.Application.Models;

namespace Movies.Application.Repositories;

public interface IUserRepository
{
    Task<bool> CreateUserAsync (User movie);
    
    Task<User?> GetByIdAsync (Guid id);
    
    Task<User?> GetByUsernameAsync (string username);
    
    Task<IEnumerable<User>> GetAllAsync ();
    
    Task<bool> UpdateUserAsync (User movie);
    
    Task<bool> DeleteUserByIdAsync (Guid id);
    
    Task<bool> ExistsByIdAsync(Guid id);
    
    Task<User?> GetByEmailAsync(string email);
    Task<bool> UpdatePasswordAsync(Guid userId, string newPasswordHash);
}