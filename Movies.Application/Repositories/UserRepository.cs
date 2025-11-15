using Dapper;
using Movies.Application.Database;
using Movies.Application.Models;
using Microsoft.Extensions.Logging;
namespace Movies.Application.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _dbConnectionFactory;
    private readonly ILogger<UserRepository> _logger;
    public UserRepository(IDbConnectionFactory dbConnectionFactory , ILogger<UserRepository> logger)
    {
        _dbConnectionFactory = dbConnectionFactory;
        _logger = logger;
    }

    public async Task<bool> CreateUserAsync(User user)
    {
        if (user == null)
        {
            _logger.LogWarning("CreateUserAsync called with null user");
            return false;
        }

        if (string.IsNullOrWhiteSpace(user.Username) || string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            _logger.LogWarning("CreateUserAsync called with invalid user data");
            return false;
        }

        try
        {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        var res = await connection.ExecuteAsync(new CommandDefinition("""
                                                                      insert into users(id, username, passwordhash, email, firstname, lastname, refreshtoken, refreshtokenexpirytime)
                                                                      values (@Id, @Username, @PasswordHash,  @Email, @FirstName, @LastName, @RefreshToken, @RefreshTokenExpiryTime)
                                                                      """, user));
            
            if (res > 0)
            {
                _logger.LogInformation("User created successfully: {Username}", user.Username);
            }
            else
            {
                _logger.LogWarning("Failed to create user: {Username}", user.Username);
            }
            
        return res > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user: {Username}", user.Username);
            return false;
        }
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
        if (string.IsNullOrWhiteSpace(username))
        {
            _logger.LogWarning("GetByUsernameAsync called with null or empty username");
            return null;
        }

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        // Нормализуем username: убираем пробелы и приводим к нижнему регистру для поиска
        var normalizedUsername = username?.Trim().ToLowerInvariant();
        _logger.LogInformation("🔍 Searching for user with normalized username: '{NormalizedUsername}'", normalizedUsername);
        
        // Пробуем найти пользователя с учетом регистра (на случай, если в базе username в другом регистре)
        var user = await connection.QuerySingleOrDefaultAsync<User>(
            new CommandDefinition("SELECT * FROM users WHERE LOWER(TRIM(username)) = @Username", new { Username = normalizedUsername }));

        if (user is null)
        {
            _logger.LogWarning("❌ User not found with normalized username: '{NormalizedUsername}'", normalizedUsername);
            
            // Попробуем найти без нормализации (на случай, если в базе есть пользователи со старым форматом)
            var trimmedUsername = username?.Trim();
            if (!string.IsNullOrWhiteSpace(trimmedUsername))
            {
                var userWithoutNormalization = await connection.QuerySingleOrDefaultAsync<User>(
                    new CommandDefinition("SELECT * FROM users WHERE username = @Username", new { Username = trimmedUsername }));
                
                if (userWithoutNormalization != null)
                {
                    _logger.LogInformation("⚠️ Found user with non-normalized username: '{Username}' (stored as: '{StoredUsername}')", 
                        trimmedUsername, userWithoutNormalization.Username);
                    user = userWithoutNormalization;
                }
                else
                {
                    // Попробуем найти с case-insensitive поиском (на случай, если регистр отличается)
                    var userCaseInsensitive = await connection.QuerySingleOrDefaultAsync<User>(
                        new CommandDefinition("SELECT * FROM users WHERE LOWER(username) = @Username", new { Username = trimmedUsername.ToLowerInvariant() }));

                    if (userCaseInsensitive != null)
                    {
                        _logger.LogInformation("⚠️ Found user with case-different username: '{Username}' (stored as: '{StoredUsername}')", 
                            trimmedUsername, userCaseInsensitive.Username);
                        user = userCaseInsensitive;
                    }
                    else
                    {
                        _logger.LogWarning("❌ User not found with any username variation: '{Username}'", trimmedUsername);
                        return null;
                    }
                }
            }
            else
            {
                return null;
            }
        }
        else
        {
            _logger.LogInformation("✅ User found: Id={UserId}, Username='{Username}'", user.Id, user.Username);
        }

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
        if (user == null)
        {
            _logger.LogWarning("UpdateUserAsync called with null user");
            return false;
        }

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Обновляем роли только если они указаны
        if (user.Roles != null && user.Roles.Any())
        {
            await connection.ExecuteAsync(new CommandDefinition("delete from userrole where userid = @userId",
                    new { userId = user.Id }, transaction));
        
            foreach (var role in user.Roles)
            {
                await connection.ExecuteAsync(new CommandDefinition("""
                    insert into userrole(userid, roleid) values (@userId, @roleId)
                    """, new { userId = user.Id, roleId = role.Id }, transaction));
            }
            }

            // Обновляем пользователя, но не обновляем passwordhash если он null (чтобы не сломать пароль)
            var sql = user.PasswordHash == null
                ? """
                  update users
                  set username = @Username,
                      email = @Email,
                      firstname = @FirstName,
                      lastname = @LastName,
                      refreshtoken = @RefreshToken,
                      refreshtokenexpirytime = @RefreshTokenExpiryTime
                  where id = @Id
                  """
                : """
                  update users
                  set username = @Username,
                      passwordhash = @PasswordHash,
                      email = @Email,
                      firstname = @FirstName,
                      lastname = @LastName,
                      refreshtoken = @RefreshToken,
                      refreshtokenexpirytime = @RefreshTokenExpiryTime
                  where id = @Id
                  """;

            var res = await connection.ExecuteAsync(new CommandDefinition(sql, user, transaction));

        transaction.Commit();
        return res > 0;
        }
        catch (Exception ex)
        {
            transaction.Rollback();
            _logger.LogError(ex, "Error updating user {UserId}", user.Id);
            throw;
        }
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

    public async Task<User?> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        // Нормализуем email: приводим к нижнему регистру и убираем пробелы
        var normalizedEmail = email.Trim().ToLowerInvariant();
        
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
    
        var user = await connection.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM users WHERE LOWER(TRIM(email)) = @Email",
            new { Email = normalizedEmail });
        
        if (user is null) return null;

        // Загружаем роли пользователя
        var roles = await connection.QueryAsync<Role>(new CommandDefinition("""
                                                                            select * from roles where id = (select roleid from userrole where userid = @Id)
                                                                            """, new { id = user.Id }));

        user.Roles = roles.ToList();

        return user;
    }
    
    public async Task<bool> UpdatePasswordAsync(Guid userId, string newPasswordHash)
    {
        const string sql = """
                               UPDATE users 
                               SET passwordhash = @PasswordHash,
                                   refreshtoken = NULL,
                                   refreshtokenexpirytime = @Now
                               WHERE id = @UserId
                           """;

        using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            
        _logger.LogInformation("🛠️ Executing SQL: {Sql}", sql);
        _logger.LogInformation("🛠️ Parameters: UserId={UserId}, PasswordHash={PasswordHash}", userId, newPasswordHash);
            
        var result = await connection.ExecuteAsync(sql, new 
        { 
            UserId = userId,
            PasswordHash = newPasswordHash,
            Now = DateTime.UtcNow
        });
            
        _logger.LogInformation("🛠️ SQL result: {Result} rows affected", result);
            
        return result > 0;
    }

}