using System.ComponentModel.DataAnnotations;

namespace Movies.Contracts.Requests
{
    public class RatingRequest
    {
        [Required]
        [Range(1, 5, ErrorMessage = "Rating value must be between 1 and 5.")]
        public int Value { get; set; }
    }
}