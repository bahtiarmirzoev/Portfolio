namespace Movies.Application.Options;

public class AiOptions
{
    public const string SectionName = "Ai";
    
    public string Provider { get; set; } = "groq"; // groq, huggingface, openai
    public string? ApiKey { get; set; }
    public string? ApiUrl { get; set; }
    public string Model { get; set; } = "llama-3.1-8b-instant"; // Для Groq
    public bool Enabled { get; set; } = true;
}

