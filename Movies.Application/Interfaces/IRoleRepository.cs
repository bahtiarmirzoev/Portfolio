using Movies.Application.Models;

namespace Movies.Application.Repositories;

public interface IRoleRepository
{
    Task<bool> CreateRoleAsync(Role role);
    Task<Role?> GetByIdAsync(int id);
    Task<Role?> GetByNameAsync(string name);
    Task<IEnumerable<Role>> GetAllAsync();
    Task<bool> UpdateRoleAsync(Role role);
    Task<bool> DeleteRoleByIdAsync(int id);
    Task<bool> ExistsByIdAsync(int id);
}