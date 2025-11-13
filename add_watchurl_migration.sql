-- Миграция: Добавление колонки watchurl в таблицы movies и series
-- Выполните этот скрипт для обновления существующей базы данных

-- Добавляем колонку watchurl в таблицу movies, если она не существует
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'movies' AND column_name = 'watchurl'
    ) THEN
        ALTER TABLE movies ADD COLUMN watchurl TEXT;
        RAISE NOTICE 'Колонка watchurl добавлена в таблицу movies';
    ELSE
        RAISE NOTICE 'Колонка watchurl уже существует в таблице movies';
    END IF;
END $$;

-- Добавляем колонку watchurl в таблицу series, если она не существует
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'series' AND column_name = 'watchurl'
    ) THEN
        ALTER TABLE series ADD COLUMN watchurl TEXT;
        RAISE NOTICE 'Колонка watchurl добавлена в таблицу series';
    ELSE
        RAISE NOTICE 'Колонка watchurl уже существует в таблице series';
    END IF;
END $$;

