namespace Movies.Application.Interfaces;

public interface IAiAssistantService
{
    Task<string> GetRecommendationAsync(string userMessage, string? userPreferences = null);
    Task<string> AnswerQuestionAsync(string question);
    Task<string> GetMovieDescriptionAsync(string movieTitle, string? existingDescription = null);
}

