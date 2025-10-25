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

        // -----------------------------
        // Таблица фильмов
        // -----------------------------
        await connection.ExecuteAsync("""
            create table if not exists movies (
                id UUID primary key,
                slug TEXT not null,
                title TEXT not null,
                yearofrelease integer not null
            );
        """);

        await connection.ExecuteAsync("""
            create unique index concurrently if not exists movies_slug_idx
            on movies(slug);
        """);

        // -----------------------------
        // Таблица жанров
        // -----------------------------
        await connection.ExecuteAsync("""
            create table if not exists genres(
                movieid UUID references movies(id),
                name TEXT not null
            );
        """);

        // -----------------------------
        // Таблица пользователей
        // -----------------------------
        await connection.ExecuteAsync("""
            create table if not exists users(
                id UUID primary key,
                username TEXT not null,
                passwordhash TEXT not null,
                email TEXT not null,
                firstname TEXT,
                lastname TEXT,
                refreshtoken TEXT,
                refreshtokenexpirytime date
            );
        """);

        await connection.ExecuteAsync("""
            create unique index concurrently if not exists users_username_idx
            on users(username);
        """);

        // -----------------------------
        // Таблица подтверждений email
        // -----------------------------
        await connection.ExecuteAsync("""
            create table if not exists email_confirmations(
                userid UUID not null,
                token TEXT not null,
                expiresat TIMESTAMP not null,
                confirmed BOOLEAN default false,
                primary key(userid, token),
                foreign key (userid) references users(id) on delete cascade
            );
        """);

        // -----------------------------
        // Таблицы ролей и связей
        // -----------------------------
        await connection.ExecuteAsync("""
            create table if not exists roles(
                id SERIAL primary key,
                name TEXT not null
            );
        """);

        await connection.ExecuteAsync("""
            create table if not exists userrole(
                id SERIAL primary key,
                userid UUID references users(id),
                roleid integer references roles(id)
            );
        """);

        // -----------------------------
        // Таблица избранного
        // -----------------------------
        await connection.ExecuteAsync("""
            create table if not exists favoritemovies(
                id UUID primary key,
                userid UUID not null references users(id) on delete cascade,
                movieid UUID not null references movies(id) on delete cascade,
                createdat TIMESTAMP not null default now(),
                constraint uq_favorite unique(userid, movieid)
            );
        """);

        await connection.ExecuteAsync("create index if not exists idx_favorite_userid on favoritemovies(userid);");
        await connection.ExecuteAsync("create index if not exists idx_favorite_movieid on favoritemovies(movieid);");

        // -----------------------------
        // Таблица рейтингов
        // -----------------------------
        await connection.ExecuteAsync("""
            create table if not exists ratings(
                id UUID primary key,
                userid UUID not null references users(id) on delete cascade,
                movieid UUID not null references movies(id) on delete cascade,
                value int not null check(value between 1 and 5),
                createdat timestamp not null default now(),
                constraint uq_rating unique(userid, movieid)
            );
        """);

        await connection.ExecuteAsync("create index if not exists idx_rating_userid on ratings(userid);");
        await connection.ExecuteAsync("create index if not exists idx_rating_movieid on ratings(movieid);");

        // -----------------------------
        // Таблица комментариев
        // -----------------------------
        await connection.ExecuteAsync("""
            create table if not exists comments (
                id UUID primary key,
                movieid UUID not null references movies(id) on delete cascade,
                userid UUID not null references users(id) on delete cascade,
                content TEXT not null,
                createdat TIMESTAMP not null default now(),
                updatedat TIMESTAMP
            );
        """);

        await connection.ExecuteAsync("create index if not exists idx_comments_movieid on comments(movieid);");
        await connection.ExecuteAsync("create index if not exists idx_comments_userid on comments(userid);");
        await connection.ExecuteAsync("create index if not exists idx_comments_createdat on comments(createdat desc);");

        // Убираем проблемный constraint или делаем его по-другому
        // Вместо ALTER TABLE с IF NOT EXISTS, просто создаем constraint при создании таблицы
        // Или используем DO block для условного создания constraint

        // -----------------------------
        // Таблица OTP
        // -----------------------------
        await connection.ExecuteAsync("""
            create table if not exists user_otps(
                id UUID primary key,
                userid UUID not null references users(id) on delete cascade,
                code TEXT not null
            );
        """);

        await connection.ExecuteAsync("create index if not exists idx_user_otps_userid on user_otps(userid);");
    }
}