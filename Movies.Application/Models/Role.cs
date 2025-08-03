namespace Movies.Application.Models;

public class Role
{
    public int Id { get; set; }
    public required string Name { get; set; }

    public ICollection<UserRole> UserRoles { get; set; }
}