// Movies.Application/Models/Results.cs
namespace Movies.Application.Models
{
    public abstract class Result
    {
        public bool Success { get; protected set; }
        public string? ErrorMessage { get; protected set; }
        public bool IsError => !Success;

        protected Result(bool success, string? errorMessage = null)
        {
            Success = success;
            ErrorMessage = errorMessage;
        }
    }

    public class OtpResult : Result
    {
        public OtpResult(bool success, string? errorMessage = null) : base(success, errorMessage)
        {
        }

        public static OtpResult SuccessResult() => new OtpResult(true);
        public static OtpResult TooManyRequests() => new OtpResult(false, "Too many OTP requests");
        public static OtpResult Error(string message) => new OtpResult(false, message);
    }

    public class OtpValidationResult : Result
    {
        public Guid? OtpId { get; }
        public OtpValidationErrorType? ErrorType { get; }
        public DateTime? LockedUntil { get; }
        public bool IsValid => Success; // ✅ ДОБАВИЛ СВОЙСТВО IsValid

        private OtpValidationResult(bool success, Guid? otpId = null, OtpValidationErrorType? errorType = null, DateTime? lockedUntil = null) 
            : base(success)
        {
            OtpId = otpId;
            ErrorType = errorType;
            LockedUntil = lockedUntil;
        }

        public static OtpValidationResult Valid(Guid otpId) => new OtpValidationResult(true, otpId);
        public static OtpValidationResult Invalid() => new OtpValidationResult(false, errorType: OtpValidationErrorType.Invalid);
        public static OtpValidationResult Expired() => new OtpValidationResult(false, errorType: OtpValidationErrorType.Expired);
        public static OtpValidationResult Locked(DateTime lockedUntil) => new OtpValidationResult(false, errorType: OtpValidationErrorType.Locked, lockedUntil: lockedUntil);
    }

    public enum OtpValidationErrorType
    {
        Invalid,
        Expired,
        Locked
    }

    public class ForgotPasswordResult : Result
    {
        public ForgotPasswordResult(bool success, string? errorMessage = null) : base(success, errorMessage)
        {
        }

        public static ForgotPasswordResult SuccessResult() => new ForgotPasswordResult(true);
        public static ForgotPasswordResult Error(string message) => new ForgotPasswordResult(false, message);
    }

    public class ResetPasswordResult : Result
    {
        public ResetPasswordErrorType? ErrorType { get; }
        public List<string>? PasswordErrors { get; }
        public DateTime? LockedUntil { get; }

        private ResetPasswordResult(bool success, ResetPasswordErrorType? errorType = null, List<string>? passwordErrors = null, DateTime? lockedUntil = null, string? errorMessage = null) 
            : base(success, errorMessage)
        {
            ErrorType = errorType;
            PasswordErrors = passwordErrors;
            LockedUntil = lockedUntil;
        }

        public static ResetPasswordResult SuccessResult() => new ResetPasswordResult(true);
        public static ResetPasswordResult InvalidOtp() => new ResetPasswordResult(false, ResetPasswordErrorType.InvalidOtp);
        public static ResetPasswordResult ExpiredOtp() => new ResetPasswordResult(false, ResetPasswordErrorType.ExpiredOtp);
        public static ResetPasswordResult LockedOtp(DateTime lockedUntil) => new ResetPasswordResult(false, ResetPasswordErrorType.Locked, lockedUntil: lockedUntil);
        public static ResetPasswordResult InvalidPassword(List<string> errors) => new ResetPasswordResult(false, ResetPasswordErrorType.InvalidPassword, passwordErrors: errors);
        public static ResetPasswordResult Error(string message) => new ResetPasswordResult(false, ResetPasswordErrorType.Other, errorMessage: message);

        public static ResetPasswordResult FromOtpValidation(OtpValidationResult otpValidation)
        {
            return otpValidation.ErrorType switch
            {
                OtpValidationErrorType.Invalid => InvalidOtp(),
                OtpValidationErrorType.Expired => ExpiredOtp(),
                OtpValidationErrorType.Locked => LockedOtp(otpValidation.LockedUntil!.Value),
                _ => Error("Invalid OTP")
            };
        }
    }

    public enum ResetPasswordErrorType
    {
        InvalidOtp,
        ExpiredOtp,
        Locked,
        InvalidPassword,
        Other
    }
}