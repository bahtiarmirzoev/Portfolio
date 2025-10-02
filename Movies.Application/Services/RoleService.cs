using Movies.Application.Models;
using Movies.Application.Repositories;
using System;
using System.Threading.Tasks;

namespace Movies.Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IUserRoleRepository _userRoleRepository;

        public RoleService(IRoleRepository roleRepository, IUserRoleRepository userRoleRepository)
        {
            _roleRepository = roleRepository;
            _userRoleRepository = userRoleRepository;
        }

        public async Task<bool> AssignRoleToUserAsync(Guid userId, string roleName)
        {
            var role = await _roleRepository.GetByNameAsync(roleName);
            if (role == null)
            {
                await _roleRepository.CreateRoleAsync(new Role { Name = roleName });
                role = await _roleRepository.GetByNameAsync(roleName);
                if (role == null) return false; 
            }

            return await _userRoleRepository.AssignRoleToUserAsync(userId, role.Id);
        }

        public async Task<bool> RemoveRoleFromUserAsync(Guid userId, string roleName)
        {
            var role = await _roleRepository.GetByNameAsync(roleName);
            if (role == null) return false;

            return await _userRoleRepository.RemoveRoleFromUserAsync(userId, role.Id);
        }

        // -----------------------------
        // Новый метод для OtpController
        // -----------------------------
        public async Task<bool> UpgradeToTrustedUserAsync(Guid userId)
        {
            const string trustedRoleName = "trusted_user";

            var role = await _roleRepository.GetByNameAsync(trustedRoleName);
            if (role == null)
            {
                // Создаем роль, если её нет
                await _roleRepository.CreateRoleAsync(new Role { Name = trustedRoleName });
                role = await _roleRepository.GetByNameAsync(trustedRoleName);
                if (role == null) return false;
            }

            // Назначаем роль пользователю
            return await _userRoleRepository.AssignRoleToUserAsync(userId, role.Id);
        }
    }
}
