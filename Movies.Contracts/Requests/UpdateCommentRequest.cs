using System.ComponentModel.DataAnnotations;

namespace Movies.Contracts.Requests;

public class UpdateCommentRequest
{
    [Required]
    [StringLength(1000, MinimumLength = 1, ErrorMessage = "Comment must be between 1 and 1000 characters.")]
    public string Content { get; set; } = string.Empty;
}
