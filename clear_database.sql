-- Скрипт для очистки всех данных из базы данных, оставляя только пользователей с ролью admin
-- ВНИМАНИЕ: Этот скрипт удалит все данные! Используйте с осторожностью!

BEGIN;

-- 1. Сохраняем ID пользователей с ролью admin во временную таблицу
CREATE TEMP TABLE admin_user_ids AS
SELECT DISTINCT u.id
FROM users u
INNER JOIN userrole ur ON u.id = ur.userid
INNER JOIN roles r ON ur.roleid = r.id
WHERE LOWER(r.name) = 'admin';

-- 2. Удаляем все данные из таблиц, связанных с пользователями (кроме админов)
DELETE FROM email_confirmations 
WHERE userid NOT IN (SELECT id FROM admin_user_ids);

DELETE FROM password_reset_tokens 
WHERE userid NOT IN (SELECT id FROM admin_user_ids);

DELETE FROM user_otps 
WHERE userid NOT IN (SELECT id FROM admin_user_ids);

DELETE FROM favoritemovies 
WHERE userid NOT IN (SELECT id FROM admin_user_ids);

DELETE FROM favoriteseries 
WHERE userid NOT IN (SELECT id FROM admin_user_ids);

DELETE FROM ratings 
WHERE userid NOT IN (SELECT id FROM admin_user_ids);

DELETE FROM series_ratings 
WHERE userid NOT IN (SELECT id FROM admin_user_ids);

DELETE FROM comments 
WHERE userid NOT IN (SELECT id FROM admin_user_ids);

DELETE FROM series_comments 
WHERE userid NOT IN (SELECT id FROM admin_user_ids);

-- 3. Удаляем все связи userrole для не-админов
DELETE FROM userrole 
WHERE userid NOT IN (SELECT id FROM admin_user_ids);

-- 4. Удаляем всех пользователей, кроме админов
DELETE FROM users 
WHERE id NOT IN (SELECT id FROM admin_user_ids);

-- 5. Удаляем все данные из таблиц контента
DELETE FROM movie_actors;
DELETE FROM series_actors;
DELETE FROM genres;
DELETE FROM series_genres;
DELETE FROM favoritemovies;
DELETE FROM favoriteseries;
DELETE FROM ratings;
DELETE FROM series_ratings;
DELETE FROM comments;
DELETE FROM series_comments;
DELETE FROM movies;
DELETE FROM series;
DELETE FROM actors;

-- 6. Очищаем токены и подтверждения для оставшихся админов (опционально, можно закомментировать)
-- DELETE FROM email_confirmations;
-- DELETE FROM password_reset_tokens;
-- DELETE FROM user_otps;

-- 7. Удаляем временную таблицу
DROP TABLE IF EXISTS admin_user_ids;

COMMIT;

-- Проверка: показываем оставшихся пользователей
SELECT u.id, u.username, u.email, r.name as role_name
FROM users u
LEFT JOIN userrole ur ON u.id = ur.userid
LEFT JOIN roles r ON ur.roleid = r.id
ORDER BY u.username;

