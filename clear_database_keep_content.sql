-- SQL скрипт для очистки базы данных
-- Оставляет только: актеров, фильмы, сериалы и admin пользователя
-- Удаляет: все комментарии, рейтинги, избранное, OTP, токены и всех пользователей кроме admin

BEGIN;

-- 1. Удаляем все комментарии к фильмам
DELETE FROM comments;

-- 2. Удаляем все комментарии к сериалам
DELETE FROM series_comments;

-- 3. Удаляем все рейтинги фильмов
DELETE FROM ratings;

-- 4. Удаляем все рейтинги сериалов
DELETE FROM series_ratings;

-- 5. Удаляем все избранные фильмы
DELETE FROM favoritemovies;

-- 6. Удаляем все избранные сериалы
DELETE FROM favoriteseries;

-- 7. Удаляем все подтверждения email
DELETE FROM email_confirmations;

-- 8. Удаляем все токены сброса пароля
DELETE FROM password_reset_tokens;

-- 9. Удаляем все OTP коды
DELETE FROM user_otps;

-- 10. Находим ID admin пользователя (по роли "admin")
DO $$
DECLARE
    admin_user_id UUID;
    admin_role_id INTEGER;
BEGIN
    -- Находим ID роли "admin"
    SELECT id INTO admin_role_id FROM roles WHERE LOWER(name) = 'admin';
    
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Role "admin" not found in roles table';
    END IF;
    
    -- Находим ID пользователя с ролью admin
    SELECT userid INTO admin_user_id 
    FROM userrole 
    WHERE roleid = admin_role_id 
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'No admin user found';
    END IF;
    
    -- Удаляем все связи пользователей и ролей, кроме admin
    DELETE FROM userrole WHERE userid != admin_user_id;
    
    -- Удаляем всех пользователей, кроме admin
    DELETE FROM users WHERE id != admin_user_id;
    
    RAISE NOTICE 'Admin user preserved: %', admin_user_id;
END $$;

-- 11. Проверяем, что admin пользователь сохранен
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM users;
    IF admin_count != 1 THEN
        RAISE EXCEPTION 'Expected exactly 1 user (admin), but found %', admin_count;
    END IF;
    RAISE NOTICE 'Database cleared successfully. Admin user preserved.';
END $$;

COMMIT;

-- Выводим статистику
SELECT 
    'users' as table_name, 
    COUNT(*) as remaining_count 
FROM users
UNION ALL
SELECT 'actors', COUNT(*) FROM actors
UNION ALL
SELECT 'movies', COUNT(*) FROM movies
UNION ALL
SELECT 'series', COUNT(*) FROM series
UNION ALL
SELECT 'movie_actors', COUNT(*) FROM movie_actors
UNION ALL
SELECT 'series_actors', COUNT(*) FROM series_actors
UNION ALL
SELECT 'genres', COUNT(*) FROM genres
UNION ALL
SELECT 'series_genres', COUNT(*) FROM series_genres
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'series_comments', COUNT(*) FROM series_comments
UNION ALL
SELECT 'ratings', COUNT(*) FROM ratings
UNION ALL
SELECT 'series_ratings', COUNT(*) FROM series_ratings
UNION ALL
SELECT 'favoritemovies', COUNT(*) FROM favoritemovies
UNION ALL
SELECT 'favoriteseries', COUNT(*) FROM favoriteseries;

