# Настройка AI-ассистента

AI-ассистент для рекомендаций фильмов и ответов на вопросы пользователей.

## 🆓 Бесплатные провайдеры

### Вариант 1: Groq (Рекомендуется) ⚡

**Groq** - быстрый и полностью бесплатный API с отличной производительностью.

1. Зарегистрируйтесь на [Groq](https://console.groq.com/)
2. Перейдите в раздел [API Keys](https://console.groq.com/keys)
3. Создайте новый API ключ (бесплатно)

**Настройка в `appsettings.json`:**
```json
{
  "Ai": {
    "Provider": "groq",
    "ApiKey": "ваш-groq-api-ключ",
    "Model": "llama-3.1-8b-instant",
    "Enabled": true
  }
}
```

**Доступные модели Groq:**
- `llama-3.1-8b-instant` (быстрая, рекомендуется)
- `llama-3.1-70b-versatile` (более мощная)
- `mixtral-8x7b-32768` (для длинных контекстов)

### Вариант 2: Hugging Face Inference API 🧠

**Hugging Face** - бесплатный API с множеством моделей.

1. Зарегистрируйтесь на [Hugging Face](https://huggingface.co/)
2. Перейдите в [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Создайте новый токен с правами `read`

**Настройка в `appsettings.json`:**
```json
{
  "Ai": {
    "Provider": "huggingface",
    "ApiKey": "ваш-huggingface-токен",
    "Model": "microsoft/DialoGPT-large",
    "Enabled": true
  }
}
```

**Рекомендуемые модели Hugging Face:**
- `microsoft/DialoGPT-large` (для чата)
- `gpt2` (базовая модель)
- `facebook/blenderbot-400M-distill` (для диалогов)

### Вариант 3: OpenAI (Платный) 💰

Если у вас есть платный аккаунт OpenAI:

```json
{
  "Ai": {
    "Provider": "openai",
    "ApiKey": "ваш-openai-api-ключ",
    "Model": "gpt-3.5-turbo",
    "Enabled": true
  }
}
```

## Настройка конфигурации

Откройте файл `Movies.Api/appsettings.json` и обновите секцию `Ai`:

```json
{
  "Ai": {
    "Provider": "groq",
    "ApiKey": "",
    "ApiUrl": "",
    "Model": "llama-3.1-8b-instant",
    "Enabled": true
  }
}
```

**Параметры:**
- `Provider` - провайдер: `groq`, `huggingface`, или `openai`
- `ApiKey` - ваш API ключ/токен
- `ApiUrl` - оставьте пустым для автоматической настройки
- `Model` - название модели (зависит от провайдера)
- `Enabled` - включить/выключить AI-ассистент

## Без API ключа

Если API ключ не настроен или `Enabled: false`, AI-ассистент будет показывать сообщение о недоступности, но интерфейс останется доступным.

## Функциональность

- 💬 Чат с AI-ассистентом
- 🎬 Рекомендации фильмов на основе предпочтений
- ❓ Ответы на вопросы о фильмах и сериалах
- 📝 Генерация описаний фильмов (для администраторов)

## API Endpoints

- `POST /api/ai/chat` - Чат с ассистентом
- `POST /api/ai/question` - Ответ на вопрос

## Использование

AI-ассистент доступен на всех страницах через плавающую кнопку в правом нижнем углу.

