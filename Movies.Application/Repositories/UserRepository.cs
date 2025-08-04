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

    public  async Task<IEnumerable<User>> GetAllAsync()
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        var result = await connection.QueryAsync(new CommandDefinition(
            """
            select u.*,string_agg(r.name , ',') as role
            from users u left join userrole r on u.id = r.userid
            group by id
            """));

        return result.Select(x => new User
        {
            Id = x.Id,
            Email = x.Email,
            FirstName = x.FirstName,
            LastName = x.LastName,
            RefreshToken = x.RefreshToken,
            RefreshTokenExpiryTime = x.RefreshTokenExpiryTime,
            Username = x.Username,
            Roles = Enumerable.ToList(x.roles.Split(',')),
            PasswordHash = null

        });

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

    public async Task<bool> DeleteUserByIdAsync(Guid id)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();
        var result = await connection.ExecuteAsync(new CommandDefinition("""
                                                                         delete from users where id = @id
                                                                         """, new {  id }));
        
        transaction.Commit();
        return result > 0;
    }

    public async Task<bool> ExistsByIdAsync(Guid id)
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        return await connection.ExecuteScalarAsync<bool>(new CommandDefinition("""
                                                                               select count(1) from users where id = @id
                                                                               """ , new {id}));
            
                                                                               
    }
}