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
// Таблица токенов сброса пароля
// -----------------------------
        await connection.ExecuteAsync("""
                                          CREATE TABLE IF NOT EXISTS password_reset_tokens (
                                              id UUID PRIMARY KEY,
                                              userid UUID REFERENCES users(id) ON DELETE CASCADE,
                                              token TEXT NOT NULL UNIQUE,
                                              expires_at TIMESTAMP NOT NULL,
                                              used BOOLEAN DEFAULT FALSE,
                                              created_at TIMESTAMP DEFAULT NOW()
                                          );
                                      """);

        await connection.ExecuteAsync("""
                                          CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
                                      """);

        await connection.ExecuteAsync("""
                                          CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_userid ON password_reset_tokens(userid);
                                      """);

        // -----------------------------
        // Таблица фильмов
        // -----------------------------
        
        await connection.ExecuteAsync("""
                                          CREATE TABLE IF NOT EXISTS movies (
                                              id UUID PRIMARY KEY,
                                              slug TEXT NOT NULL,
                                              title TEXT NOT NULL,
                                              yearofrelease INTEGER NOT NULL,
                                              description TEXT,
                                              posterurl TEXT, -- 🆕 Добавляем постер
                                              trailerurl TEXT -- 🆕 Добавляем трейлер
                                          );
                                      """);
        // В DbInitializer.InitializeAsync() добавьте:
// -----------------------------
// Таблица актеров
// -----------------------------
        await connection.ExecuteAsync("""
                                          CREATE TABLE IF NOT EXISTS actors (
                                              id UUID PRIMARY KEY,
                                              name TEXT NOT NULL,
                                              dateofbirth DATE,
                                              biography TEXT
                                          );
                                      """);

// -----------------------------
// Таблица связи фильмов и актеров (many-to-many)
// -----------------------------
        await connection.ExecuteAsync("""
                                          CREATE TABLE IF NOT EXISTS movie_actors (
                                              id SERIAL PRIMARY KEY,
                                              movieid UUID REFERENCES movies(id) ON DELETE CASCADE,
                                              actorid UUID REFERENCES actors(id) ON DELETE CASCADE,
                                              character_name TEXT,
                                              "order" INTEGER DEFAULT 0
                                          );
                                      """);

        await connection.ExecuteAsync("""
                                          CREATE INDEX IF NOT EXISTS idx_movie_actors_movieid ON movie_actors(movieid);
                                      """);

        await connection.ExecuteAsync("""
                                          CREATE INDEX IF NOT EXISTS idx_movie_actors_actorid ON movie_actors(actorid);
                                      """);

        await connection.ExecuteAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_movies_slug
            ON movies(slug);
        """);

        // -----------------------------
        // Таблица жанров
        // -----------------------------
        await connection.ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS genres (
                id SERIAL PRIMARY KEY,
                movieid UUID REFERENCES movies(id) ON DELETE CASCADE,
                name TEXT NOT NULL
            );
        """);

        await connection.ExecuteAsync("""
            CREATE INDEX IF NOT EXISTS idx_genres_movieid
            ON genres(movieid);
        """);

        // -----------------------------
        // Таблица пользователей
        // -----------------------------
        await connection.ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                username TEXT NOT NULL,
                passwordhash TEXT NOT NULL,
                email TEXT NOT NULL,
                firstname TEXT,
                lastname TEXT,
                refreshtoken TEXT,
                refreshtokenexpirytime TIMESTAMP
            );
        """);

        await connection.ExecuteAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username
            ON users(username);
        """);

        // -----------------------------
        // Таблица подтверждения email
        // -----------------------------
        await connection.ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS email_confirmations (
                userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token TEXT NOT NULL,
                expiresat TIMESTAMP NOT NULL,
                confirmed BOOLEAN DEFAULT FALSE,
                PRIMARY KEY (userid, token)
            );
        """);

        // -----------------------------
        // Таблицы ролей и связей
        // -----------------------------
        await connection.ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL
            );
        """);

        await connection.ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS userrole (
                id SERIAL PRIMARY KEY,
                userid UUID REFERENCES users(id) ON DELETE CASCADE,
                roleid INTEGER REFERENCES roles(id) ON DELETE CASCADE
            );
        """);

        // -----------------------------
        // Таблица избранного
        // -----------------------------
        await connection.ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS favoritemovies (
                id UUID PRIMARY KEY,
                userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                movieid UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
                createdat TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT uq_favorite UNIQUE (userid, movieid)
            );
        """);

        await connection.ExecuteAsync("""
            CREATE INDEX IF NOT EXISTS idx_favorite_userid ON favoritemovies(userid);
        """);

        await connection.ExecuteAsync("""
            CREATE INDEX IF NOT EXISTS idx_favorite_movieid ON favoritemovies(movieid);
        """);

        // -----------------------------
        // Таблица рейтингов
        // -----------------------------
        await connection.ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS ratings (
                id UUID PRIMARY KEY,
                userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                movieid UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
                value INTEGER NOT NULL CHECK (value BETWEEN 1 AND 5),
                createdat TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT uq_rating UNIQUE (userid, movieid)
            );
        """);

        await connection.ExecuteAsync("""
            CREATE INDEX IF NOT EXISTS idx_rating_userid ON ratings(userid);
        """);

        await connection.ExecuteAsync("""
            CREATE INDEX IF NOT EXISTS idx_rating_movieid ON ratings(movieid);
        """);

        // -----------------------------
        // Таблица комментариев
        // -----------------------------
        await connection.ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS comments (
                id UUID PRIMARY KEY,
                movieid UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
                userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                createdat TIMESTAMP NOT NULL DEFAULT now(),
                updatedat TIMESTAMP
            );
        """);

        await connection.ExecuteAsync("""
            CREATE INDEX IF NOT EXISTS idx_comments_movieid ON comments(movieid);
        """);

        await connection.ExecuteAsync("""
            CREATE INDEX IF NOT EXISTS idx_comments_userid ON comments(userid);
        """);

        await connection.ExecuteAsync("""
            CREATE INDEX IF NOT EXISTS idx_comments_createdat ON comments(createdat DESC);
        """);

        // -----------------------------
        // Таблица OTP-кодов
        // -----------------------------
        await connection.ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS user_otps (
                id UUID PRIMARY KEY,
                userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                code TEXT NOT NULL
            );
        """);

        await connection.ExecuteAsync("""
            CREATE INDEX IF NOT EXISTS idx_user_otps_userid ON user_otps(userid);
        """);
    }
    
}
