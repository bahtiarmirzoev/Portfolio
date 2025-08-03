namespace Movies.Application.Models;

public class User
{
    public Guid Id { get; init; }

    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public string? ImageUrl { get; set; }

    public required string Email { get; set; }
    public bool IsEmailConfirmed { get; set; }

    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    public ICollection<Role> Roles { get; set; }

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
}