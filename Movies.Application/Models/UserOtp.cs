namespace Movies.Application.Models;

public class UserOtp
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Code { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public bool Used { get; set; }
    
    public int Attempts { get; set; } 
    
    public DateTime? LockedUntil { get; set; } 
    
    
}