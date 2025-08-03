using Movies.Application.Models;
using Movies.Application.Services;
using Movies.Contracts.Requests;

namespace Movies.Api.Mapping;

public static class UserMapping
{
    public static User MapToUser(this CreateUserRequest user)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Username = user.Username,
            PasswordHash = PasswordHasher.Generate(user.Password),
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName
        };
    }
}