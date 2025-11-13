using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using Movies.Application.Interfaces;
using Movies.Application.Options;

namespace Movies.Application.Services;

public class AiAssistantService : IAiAssistantService
{
    private readonly AiOptions _options;
    private readonly HttpClient _httpClient;
    private readonly IMovieService _movieService;
    private readonly ISeriesService _seriesService;

    public AiAssistantService(
        IOptions<AiOptions> options,
        HttpClient httpClient,
        IMovieService movieService,
        ISeriesService seriesService)
    {
        _options = options.Value;
        _httpClient = httpClient;
        _movieService = movieService;
        _seriesService = seriesService;
        
        // Authorization header уже добавлен в Program.cs при настройке HttpClient
        // Не добавляем его здесь, чтобы избежать дублирования
    }

    public async Task<string> GetRecommendationAsync(string userMessage, string? userPreferences = null)
    {
        if (!_options.Enabled || string.IsNullOrEmpty(_options.ApiKey))
        {
            return "Извините, AI-ассистент временно недоступен. Попробуйте использовать поиск и фильтры для поиска фильмов.";
        }

        try
        {
            // Получаем данные о фильмах и сериалах с актерами и жанрами
            var moviesResult = await _movieService.GetAllAsync(0, 50);
            var seriesResult = await _seriesService.GetAllAsync(0, 50);
            
            // Формируем детальную информацию о фильмах
            var moviesInfo = moviesResult.movies.Select(m => 
            {
                var actors = m.Actors?.Any() == true 
                    ? string.Join(", ", m.Actors.Select(a => a.Name))
                    : "не указаны";
                var genres = m.Genres?.Any() == true 
                    ? string.Join(", ", m.Genres)
                    : "не указаны";
                return $"• {m.Title} ({m.YearOfRelease}) - Жанры: {genres}, Актеры: {actors}";
            }).Take(30);
            
            // Формируем детальную информацию о сериалах
            var seriesInfo = seriesResult.series.Select(s => 
            {
                var actors = s.Actors?.Any() == true 
                    ? string.Join(", ", s.Actors.Select(a => a.Name))
                    : "не указаны";
                var genres = s.Genres?.Any() == true 
                    ? string.Join(", ", s.Genres)
                    : "не указаны";
                return $"• {s.Title} ({s.YearOfRelease}) - Жанры: {genres}, Актеры: {actors}";
            }).Take(30);
            
            // Собираем уникальных актеров
            var allActors = moviesResult.movies
                .SelectMany(m => m.Actors ?? new List<Actor>())
                .Concat(seriesResult.series.SelectMany(s => s.Actors ?? new List<Actor>()))
                .GroupBy(a => a.Name)
                .Select(g => g.Key)
                .Distinct()
                .OrderBy(a => a)
                .Take(50);
            
            // Собираем уникальные жанры
            var allGenres = moviesResult.movies
                .SelectMany(m => m.Genres ?? new List<string>())
                .Concat(seriesResult.series.SelectMany(s => s.Genres ?? new List<string>()))
                .Distinct()
                .OrderBy(g => g);

            var systemPrompt = @"Ты - AI-ассистент кинотеатра. Твоя задача - помогать пользователям находить фильмы и сериалы из каталога.

ВАЖНО: Используй ТОЛЬКО информацию из предоставленного каталога. Не придумывай фильмы или сериалы, которых нет в каталоге.

ДОСТУПНЫЕ ФИЛЬМЫ В КАТАЛОГЕ:
" + string.Join("\n", moviesInfo) + @"

ДОСТУПНЫЕ СЕРИАЛЫ В КАТАЛОГЕ:
" + string.Join("\n", seriesInfo) + @"

ДОСТУПНЫЕ АКТЕРЫ: " + string.Join(", ", allActors) + @"

ДОСТУПНЫЕ ЖАНРЫ: " + string.Join(", ", allGenres) + @"

Отвечай дружелюбно и по делу. Если пользователь спрашивает о конкретном фильме или сериале, используй информацию из каталога выше. 
Если фильм или сериал не найден в каталоге, честно скажи об этом и предложи похожие варианты из каталога.";

            var userPrompt = userMessage;
            if (!string.IsNullOrEmpty(userPreferences))
            {
                userPrompt += $"\n\nПредпочтения пользователя: {userPreferences}";
            }

            var response = await CallOpenAiAsync(systemPrompt, userPrompt);
            return response;
        }
        catch (Exception ex)
        {
            return $"Произошла ошибка при обработке запроса: {ex.Message}";
        }
    }

    public async Task<string> AnswerQuestionAsync(string question)
    {
        if (!_options.Enabled || string.IsNullOrEmpty(_options.ApiKey))
        {
            return "Извините, AI-ассистент временно недоступен.";
        }

        try
        {
            // Получаем данные о фильмах и сериалах с актерами и жанрами
            var moviesResult = await _movieService.GetAllAsync(0, 50);
            var seriesResult = await _seriesService.GetAllAsync(0, 50);
            
            // Формируем детальную информацию о фильмах
            var moviesInfo = moviesResult.movies.Select(m => 
            {
                var actors = m.Actors?.Any() == true 
                    ? string.Join(", ", m.Actors.Select(a => a.Name))
                    : "не указаны";
                var genres = m.Genres?.Any() == true 
                    ? string.Join(", ", m.Genres)
                    : "не указаны";
                var description = !string.IsNullOrEmpty(m.Description) 
                    ? $"\n  Описание: {m.Description.Substring(0, Math.Min(200, m.Description.Length))}..."
                    : "";
                return $"• {m.Title} ({m.YearOfRelease}) - Жанры: {genres}, Актеры: {actors}{description}";
            }).Take(30);
            
            // Формируем детальную информацию о сериалах
            var seriesInfo = seriesResult.series.Select(s => 
            {
                var actors = s.Actors?.Any() == true 
                    ? string.Join(", ", s.Actors.Select(a => a.Name))
                    : "не указаны";
                var genres = s.Genres?.Any() == true 
                    ? string.Join(", ", s.Genres)
                    : "не указаны";
                var description = !string.IsNullOrEmpty(s.Description) 
                    ? $"\n  Описание: {s.Description.Substring(0, Math.Min(200, s.Description.Length))}..."
                    : "";
                return $"• {s.Title} ({s.YearOfRelease}) - Жанры: {genres}, Актеры: {actors}{description}";
            }).Take(30);
            
            // Собираем уникальных актеров
            var allActors = moviesResult.movies
                .SelectMany(m => m.Actors ?? new List<Actor>())
                .Concat(seriesResult.series.SelectMany(s => s.Actors ?? new List<Actor>()))
                .GroupBy(a => a.Name)
                .Select(g => g.Key)
                .Distinct()
                .OrderBy(a => a)
                .Take(50);
            
            // Собираем уникальные жанры
            var allGenres = moviesResult.movies
                .SelectMany(m => m.Genres ?? new List<string>())
                .Concat(seriesResult.series.SelectMany(s => s.Genres ?? new List<string>()))
                .Distinct()
                .OrderBy(g => g);

            var systemPrompt = @"Ты - AI-ассистент кинотеатра. Отвечай на вопросы пользователей о фильмах, сериалах, жанрах и актерах из каталога.

ВАЖНО: Используй ТОЛЬКО информацию из предоставленного каталога. Не придумывай информацию о фильмах или сериалах, которых нет в каталоге.

ДОСТУПНЫЕ ФИЛЬМЫ В КАТАЛОГЕ:
" + string.Join("\n", moviesInfo) + @"

ДОСТУПНЫЕ СЕРИАЛЫ В КАТАЛОГЕ:
" + string.Join("\n", seriesInfo) + @"

ДОСТУПНЫЕ АКТЕРЫ: " + string.Join(", ", allActors) + @"

ДОСТУПНЫЕ ЖАНРЫ: " + string.Join(", ", allGenres) + @"

Будь дружелюбным и полезным. Если пользователь спрашивает о конкретном фильме, сериале, актере или жанре, используй информацию из каталога выше.
Если информация не найдена в каталоге, честно скажи об этом и предложи использовать поиск на сайте.";

            var response = await CallOpenAiAsync(systemPrompt, question);
            return response;
        }
        catch (Exception ex)
        {
            return $"Произошла ошибка: {ex.Message}";
        }
    }

    public async Task<string> GetMovieDescriptionAsync(string movieTitle, string? existingDescription = null)
    {
        if (!_options.Enabled || string.IsNullOrEmpty(_options.ApiKey))
        {
            return existingDescription ?? "Описание недоступно";
        }

        try
        {
            var systemPrompt = @"Ты - помощник для создания описаний фильмов. Создай краткое, увлекательное описание фильма на основе названия.
Описание должно быть 2-3 предложения, интересным и информативным.";

            var userPrompt = $"Создай описание для фильма: {movieTitle}";
            if (!string.IsNullOrEmpty(existingDescription))
            {
                userPrompt += $"\nТекущее описание: {existingDescription}\nУлучши или дополни его.";
            }

            var response = await CallOpenAiAsync(systemPrompt, userPrompt);
            return response;
        }
        catch (Exception ex)
        {
            return existingDescription ?? $"Ошибка генерации описания: {ex.Message}";
        }
    }

    private async Task<string> CallOpenAiAsync(string systemPrompt, string userPrompt)
    {
        try
        {
            // Определяем URL и формат запроса в зависимости от провайдера
            string apiUrl;
            object requestBody;
            
            switch (_options.Provider.ToLower())
            {
                case "groq":
                    apiUrl = string.IsNullOrEmpty(_options.ApiUrl) 
                        ? "/openai/v1/chat/completions"
                        : _options.ApiUrl;
                    requestBody = new
                    {
                        model = _options.Model,
                        messages = new[]
                        {
                            new { role = "system", content = systemPrompt },
                            new { role = "user", content = userPrompt }
                        },
                        max_tokens = 1000,
                        temperature = 0.7
                    };
                    break;
                    
                case "huggingface":
                    // Hugging Face требует полный URL с моделью
                    if (string.IsNullOrEmpty(_options.ApiUrl))
                    {
                        var modelName = string.IsNullOrEmpty(_options.Model) 
                            ? "microsoft/DialoGPT-large" 
                            : _options.Model;
                        apiUrl = $"https://api-inference.huggingface.co/models/{modelName}";
                    }
                    else
                    {
                        apiUrl = _options.ApiUrl;
                    }
                    requestBody = new
                    {
                        inputs = $"{systemPrompt}\n\nUser: {userPrompt}\nAssistant:",
                        parameters = new
                        {
                            max_new_tokens = 1000,
                            temperature = 0.7,
                            return_full_text = false
                        }
                    };
                    break;
                    
                case "openai":
                default:
                    apiUrl = string.IsNullOrEmpty(_options.ApiUrl)
                        ? "/v1/chat/completions"
                        : _options.ApiUrl;
                    requestBody = new
                    {
                        model = _options.Model,
                        messages = new[]
                        {
                            new { role = "system", content = systemPrompt },
                            new { role = "user", content = userPrompt }
                        },
                        max_tokens = 1000,
                        temperature = 0.7
                    };
                    break;
            }

            var requestOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            
            var json = JsonSerializer.Serialize(requestBody, requestOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Если указан полный URL (начинается с http), используем временный HttpClient
            // Иначе используем настроенный HttpClient с BaseAddress
            HttpResponseMessage response;
            if (apiUrl.StartsWith("http"))
            {
                // Создаем временный HttpClient для полного URL
                using var tempClient = new HttpClient();
                if (!string.IsNullOrEmpty(_options.ApiKey))
                {
                    tempClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_options.ApiKey}");
                }
                if (_options.Provider.ToLower() == "huggingface")
                {
                    tempClient.DefaultRequestHeaders.Add("Accept", "application/json");
                }
                response = await tempClient.PostAsync(apiUrl, content);
            }
            else
            {
                // Используем настроенный HttpClient с BaseAddress
                response = await _httpClient.PostAsync(apiUrl, content);
            }
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"{_options.Provider} API error: {response.StatusCode} - {errorContent}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            
            // Обработка ответа в зависимости от провайдера
            if (_options.Provider.ToLower() == "huggingface")
            {
                // Hugging Face может вернуть массив или объект
                try
                {
                    // Пробуем десериализовать как массив
                    var hfArrayResponse = JsonSerializer.Deserialize<List<HuggingFaceResponse>>(responseJson);
                    if (hfArrayResponse != null && hfArrayResponse.Count > 0)
                    {
                        return hfArrayResponse[0].GeneratedText?.Trim() ?? "Не удалось получить ответ";
                    }
                }
                catch
                {
                    // Если не массив, пробуем как объект
                    var hfResponse = JsonSerializer.Deserialize<HuggingFaceResponse>(responseJson);
                    return hfResponse?.GeneratedText?.Trim() ?? "Не удалось получить ответ";
                }
                return "Не удалось получить ответ";
            }
            else
            {
                // Groq и OpenAI используют одинаковый формат ответа
                var responseData = JsonSerializer.Deserialize<OpenAiResponse>(responseJson);
                return responseData?.Choices?.FirstOrDefault()?.Message?.Content ?? "Не удалось получить ответ";
            }
        }
        catch (HttpRequestException ex)
        {
            throw new Exception($"Ошибка при обращении к {_options.Provider} API: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            throw new Exception($"Неожиданная ошибка: {ex.Message}", ex);
        }
    }

    private class OpenAiResponse
    {
        [JsonPropertyName("choices")]
        public List<Choice>? Choices { get; set; }
    }

    private class Choice
    {
        [JsonPropertyName("message")]
        public Message? Message { get; set; }
    }

    private class Message
    {
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }

    private class HuggingFaceResponse
    {
        [JsonPropertyName("generated_text")]
        public string? GeneratedText { get; set; }
    }
}

