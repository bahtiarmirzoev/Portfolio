using Movies.Contracts.Responses;
using System.Linq;

namespace Movies.Contracts.Responses;

public class ActorDetailResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public DateOnly? DateOfBirth { get; init; }
    public string? Biography { get; init; }
    public required IEnumerable<MovieResponse> Movies { get; init; } = Enumerable.Empty<MovieResponse>();
    public required IEnumerable<SeriesResponse> Series { get; init; } = Enumerable.Empty<SeriesResponse>();
}
