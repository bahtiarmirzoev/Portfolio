using System;

namespace Movies.Application.Models
{
    public class Rating
    {
        public Guid Id { get; set; }        
        public Guid UserId { get; set; }      
        public Guid MovieId { get; set; }     
        public int Value { get; set; }        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}