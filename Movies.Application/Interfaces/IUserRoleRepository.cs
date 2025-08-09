using System;
using System.Threading.Tasks;

namespace Movies.Application.Repositories
{
    public interface IUserRoleRepository
    {
        Task<bool> AssignRoleToUserAsync(Guid userId, int roleId);
        Task<bool> RemoveRoleFromUserAsync(Guid userId, int roleId);
       
    }
}