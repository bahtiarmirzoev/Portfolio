namespace Movies.Application.Services;

public class PasswordHasher
{
    public static string Generate(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ArgumentException("Password cannot be null or empty", nameof(password));
        }

        try
        {
            var hash = BCrypt.Net.BCrypt.EnhancedHashPassword(password);
            return hash;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to hash password", ex);
        }
    }

    public static bool Verify(string password, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            return false;
        }

        try
        {
            if (!passwordHash.StartsWith("$2"))
            {
                System.Diagnostics.Debug.WriteLine($"Password hash does not start with $2: {passwordHash.Substring(0, Math.Min(20, passwordHash.Length))}...");
                return false;
            }

            var result = BCrypt.Net.BCrypt.EnhancedVerify(password, passwordHash);
            return result;
        }
        catch (BCrypt.Net.SaltParseException ex)
        {
            System.Diagnostics.Debug.WriteLine($"BCrypt salt parse error: {ex.Message}");
            return false;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Password verification error: {ex.GetType().Name} - {ex.Message}");
            return false;
        }
    }
}