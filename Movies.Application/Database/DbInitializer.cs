using Dapper;

namespace Movies.Application.Database;

public class DbInitializer
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    public DbInitializer(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task InitializeAsync()
    {
        using var connection = await _dbConnectionFactory.CreateConnectionAsync();

        await connection.ExecuteAsync("""
                                          create table if not exists movies (
                                              id UUID primary key,
                                              slug TEXT not null,
                                              title TEXT not null,
                                              yearofrelease integer not null);
                                      """);


        await connection.ExecuteAsync("""
                                          create unique index concurrently if not exists movies_slug_idx
                                          on movies
                                          using btree(slug);
                                      """);

        await connection.ExecuteAsync("""
                                      create table if not exists genres(
                                          movieId UUID references movies (id),
                                          name text not null
                                      );
                                      """);

        await connection.ExecuteAsync("""
                                      create table if not exists users(
                                          id  UUID primary key,
                                          username TEXT not null,
                                          passwordHash TEXT not null,
                                          email TEXT not null,
                                          firstName TEXT,
                                          lastName TEXT,
                                          refreshToken TEXT,
                                          refreshTokenExpiryTime date
                                      );
                                      """);
        await connection.ExecuteAsync("""
                                          create table if not exists email_confirmations(
                                              userId UUID not null,
                                              token TEXT not null,
                                              expiresAt TIMESTAMP not null,
                                              confirmed BOOLEAN default false,
                                              primary key(userId, token),
                                              foreign key (userId) references users(id) on delete cascade
                                          );
                                      """);


        await connection.ExecuteAsync("""
                                          create unique index concurrently if not exists users_username_idx
                                          on users
                                          using btree(username);
                                      """);

        await connection.ExecuteAsync("""
                                      create table if not exists roles(
                                          id SERIAL primary key ,
                                          name TEXT not null
                                      );
                                      """);

        await connection.ExecuteAsync("""
                                      create table if not exists userRole(
                                          id SERIAL primary key,
                                          userId UUID references users (id),
                                          roleId integer references roles (id)
                                      );
                                      """);
        
    }
}