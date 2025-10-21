using Dapper;
using Movies.Application.Database;
using System;
using System.Threading.Tasks;

namespace Movies.Application.Repositories
{
    public class UserRoleRepository : IUserRoleRepository
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public UserRoleRepository(IDbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task<bool> AssignRoleToUserAsync(Guid userId, int roleId)
        {
            if (await HasRoleAsync(userId, roleId))
                return false; 

            const string sql = """
                                   insert into userrole ("userid", "roleid")
                                   values (@UserId, @RoleId);
                               """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var res = await connection.ExecuteAsync(sql, new { UserId = userId, RoleId = roleId });
            return res > 0;
        }

        public async Task<bool> RemoveRoleFromUserAsync(Guid userId, int roleId)
        {
            const string sql = """
                                   delete from userrole
                                   where "userid" = @UserId and "roleid" = @RoleId;
                               """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var res = await connection.ExecuteAsync(sql, new { UserId = userId, RoleId = roleId });
            return res > 0;
        }

        public async Task<bool> HasRoleAsync(Guid userId, int roleId)
        {
            const string sql = """
                                   select count(1)
                                   from userrole
                                   where "userid" = @UserId and "roleid" = @RoleId;
                               """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var count = await connection.ExecuteScalarAsync<int>(sql, new { UserId = userId, RoleId = roleId });
            return count > 0;
        }
    }
}