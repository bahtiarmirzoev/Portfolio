using Dapper;
using Movies.Application.Database;
using Movies.Application.Models;

namespace Movies.Application.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    public RoleRepository(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<bool> CreateRoleAsync(Role role)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        var res = await connection.ExecuteAsync(new CommandDefinition("""
            insert into roles (name)
            values (@Name)
        """, role));

        return res > 0;
    }

    public async Task<Role?> GetByIdAsync(int id)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        return await connection.QuerySingleOrDefaultAsync<Role>(
            new CommandDefinition("select * from roles where id = @Id", new { Id = id }));
    }

    public async Task<Role?> GetByNameAsync(string name)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        return await connection.QuerySingleOrDefaultAsync<Role>(
            new CommandDefinition("select * from roles where name = @Name", new { Name = name }));
    }

    public async Task<IEnumerable<Role>> GetAllAsync()
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        return await connection.QueryAsync<Role>(
            new CommandDefinition("select * from roles"));
    }

    public async Task<bool> UpdateRoleAsync(Role role)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        var res = await connection.ExecuteAsync(new CommandDefinition("""
            update roles
            set name = @Name
            where id = @Id
        """, role));

        return res > 0;
    }

    public async Task<bool> DeleteRoleByIdAsync(int id)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        var res = await connection.ExecuteAsync(new CommandDefinition("""
            delete from roles where id = @Id
        """, new { Id = id }));

        return res > 0;
    }

    public async Task<bool> ExistsByIdAsync(int id)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        return await connection.ExecuteScalarAsync<bool>(
            new CommandDefinition("select count(1) from roles where id = @Id", new { Id = id }));
    }
}
