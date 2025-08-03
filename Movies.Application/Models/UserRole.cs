namespace Movies.Application.Models;

public class UserRole
{
    public int Id { get; set; }

    public Guid UserId { get; set; }
    public virtual required User User { get; set; }

    public int RoleId { get; set; }
    public virtual required Role Role { get; set; }
}