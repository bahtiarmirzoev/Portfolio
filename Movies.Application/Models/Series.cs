using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Movies.Application.Models;

public partial class Series
{
    public required Guid Id { get; init; }
    public required string Title { get; set; }
    public string Slug => GenerateSlug();
    public required int YearOfRelease { get; set; }
    public int? YearOfEnd { get; set; } // Год окончания (null если еще идет)
    public string? Description { get; set; }
    public string? PosterUrl { get; set; }
    public string? TrailerUrl { get; set; }
    public string? WatchUrl { get; set; } // Ссылка на внешний киносервис для просмотра
    public required List<string> Genres { get; set; } = new();
    public double? AverageRating { get; set; }
    public List<Actor> Actors { get; set; } = new();
    public int? TotalSeasons { get; set; } // Количество сезонов
    public int? TotalEpisodes { get; set; } // Общее количество серий
    public bool IsOngoing { get; set; } // Продолжается ли показ

    private string GenerateSlug()
    {
        var sluggedTitle = SlugRegex().Replace(Title, string.Empty)
            .ToLower().Replace(" ", "-");
        return $"{sluggedTitle}-{YearOfRelease}";
    }

    [GeneratedRegex(@"[^a-zA-Z0-9 _-]", RegexOptions.NonBacktracking, 5)]
    private static partial Regex SlugRegex();
}