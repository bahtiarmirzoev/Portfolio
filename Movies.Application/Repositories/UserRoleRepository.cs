using Dapper;
using Movies.Application.Database;

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
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();

            var res = await connection.ExecuteAsync(new CommandDefinition("""
                                                                              insert into userrole (userid, roleid)
                                                                              values (@UserId, @RoleId)
                                                                          """, new { UserId = userId, RoleId = roleId }));

            return res > 0;
        }

        public async Task<bool> RemoveRoleFromUserAsync(Guid userId, int roleId)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();

            var res = await connection.ExecuteAsync(new CommandDefinition("""
                                                                              delete from userrole
                                                                              where userid = @UserId and roleid = @RoleId
                                                                          """, new { UserId = userId, RoleId = roleId }));

            return res > 0;
        }

        
    }
}