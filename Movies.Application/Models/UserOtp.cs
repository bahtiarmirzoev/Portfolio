using System;

namespace Movies.Application.Models
{
    public class UserOtp
    {
        public Guid Id { get; set; }      
        public Guid UserId { get; set; }  
        public string Code { get; set; }  
    }
}