using Dapper;
using Movies.Application.Database;
using Movies.Application.Models;

namespace Movies.Application.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    public UserRepository(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<bool> CreateUserAsync(User user)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        var res = await connection.ExecuteAsync(new CommandDefinition("""
                                                                      insert into users(id, username, passwordhash, email, firstname, lastname, refreshtoken, refreshtokenexpirytime)
                                                                      values (@Id, @Username, @PasswordHash,  @Email, @FirstName, @LastName, @RefreshToken, @RefreshTokenExpiryTime)
                                                                      """, user));
        return res > 0;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        var user = await connection.QuerySingleOrDefaultAsync<User>(
            new CommandDefinition("select * from users where id = @Id", new { Id = id }));

        if (user is null) return null;

        var roles = await connection.QueryAsync<Role>(new CommandDefinition("""
                                                                            select * from roles where id = (select roleid from userrole where userid = @Id)
                                                                            """, new { id = user.Id }));

        user.Roles = roles.ToList();

        return user;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        var user = await connection.QuerySingleOrDefaultAsync<User>(
            new CommandDefinition("select * from users where username = @username", new { username }));

        if (user is null) return null;

        var roles = await connection.QueryAsync<Role>(new CommandDefinition("""
                                                                            select * from roles where id = (select roleid from userrole where userid = @Id)
                                                                            """, new { id = user.Id }));

        user.Roles = roles.ToList();

        return user;
    }

    public Task<IEnumerable<User>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<bool> UpdateUserAsync(User user)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        await connection.ExecuteAsync(new CommandDefinition("delete from userrole where userid = @userId",
            new { userId = user.Id }));
        foreach (var role in user.Roles)
            await connection.ExecuteAsync(new CommandDefinition("""
                                                                insert into userrole(userid, roleid) values (@userId, @roleId)
                                                                """, new { userId = user.Id, roleId = role.Id }));

        var res = await connection.ExecuteAsync(new CommandDefinition("""
                                                                      update users
                                                                      set username = @Username,
                                                                          passwordhash = @PasswordHash,
                                                                          email = @Email,
                                                                          firstname = @FirstName,
                                                                          lastname = @LastName,
                                                                          refreshtoken = @RefreshToken,
                                                                          refreshtokenexpirytime = @RefreshTokenExpiryTime
                                                                          where id = @Id
                                                                      """,
            user));

        transaction.Commit();
        return res > 0;
    }

    public Task<bool> DeleteUserByIdAsync(Guid id)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ExistsByIdAsync(Guid id)
    {
        throw new NotImplementedException();
    }
}