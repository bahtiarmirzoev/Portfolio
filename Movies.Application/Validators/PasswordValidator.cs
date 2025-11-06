using System.Text.RegularExpressions;

namespace Movies.Application.Services
{
    public interface IPasswordValidator
    {
        PasswordValidationResult Validate(string password);
    }

    public class PasswordValidator : IPasswordValidator
    {
        public PasswordValidationResult Validate(string password)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(password))
            {
                errors.Add("Password cannot be empty");
                return new PasswordValidationResult(false, errors);
            }

            if (password.Length < 8)
                errors.Add("Password must be at least 8 characters long");

            if (!Regex.IsMatch(password, @"[a-z]"))
                errors.Add("Password must contain at least one lowercase letter");

            if (!Regex.IsMatch(password, @"[A-Z]"))
                errors.Add("Password must contain at least one uppercase letter");

            if (!Regex.IsMatch(password, @"\d"))
                errors.Add("Password must contain at least one digit");

            if (!Regex.IsMatch(password, @"[^\da-zA-Z]"))
                errors.Add("Password must contain at least one special character");

            return new PasswordValidationResult(!errors.Any(), errors);
        }
    }

    public class PasswordValidationResult
    {
        public bool IsValid { get; }
        public List<string> Errors { get; }

        public PasswordValidationResult(bool isValid, List<string> errors)
        {
            IsValid = isValid;
            Errors = errors;
        }
    }
}