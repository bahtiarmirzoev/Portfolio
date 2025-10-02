using System;
using System.Threading.Tasks;

namespace Movies.Application.Services
{
    public interface IRoleService
    {
        Task<bool> AssignRoleToUserAsync(Guid userId, string roleName);
        Task<bool> RemoveRoleFromUserAsync(Guid userId, string roleName);

        Task<bool> UpgradeToTrustedUserAsync(Guid userId);
    }
}