public class UserOtp
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Code { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }  // обязательно
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}