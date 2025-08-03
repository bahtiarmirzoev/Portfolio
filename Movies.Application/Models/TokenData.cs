namespace Movies.Contracts.Responses;

public record TokenData(
    string AccessToken,
    string RefreshToken,
    DateTime RefreshTokenExpired
);