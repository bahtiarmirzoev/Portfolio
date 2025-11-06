# Cinema Frontend

Современный минималистичный фронтенд для Cinema API с анимациями и красивым дизайном.

## Технологии

- **React 18** - UI библиотека
- **Vite** - Сборщик и dev сервер
- **Tailwind CSS** - Стилизация
- **Framer Motion** - Анимации
- **React Router** - Роутинг
- **Axios** - HTTP клиент
- **React Hot Toast** - Уведомления

## Установка

```bash
cd frontend
npm install
```

## Запуск

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Настройка API

По умолчанию фронтенд настроен на работу с API по адресу `http://localhost:5000/api`.

Если ваш API работает на другом адресе, создайте файл `.env` в папке `frontend`:

```env
VITE_API_URL=http://your-api-url/api
```

## Структура проекта

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   └── Home.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── authService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Функциональность

### Аутентификация

- ✅ Регистрация (Sign Up)
- ✅ Вход (Sign In)
- ✅ Выход (Sign Out)
- ✅ Забыли пароль (Forgot Password)
- ✅ Сброс пароля (Reset Password)
- ✅ Обновление токена (Token Refresh)
- ✅ Защищенные маршруты

### Дизайн

- Минималистичный дизайн с glassmorphism эффектом
- Плавные анимации при переходах
- Адаптивная верстка
- Современная цветовая схема

## Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `dist/`.

