using System.ComponentModel.DataAnnotations;

namespace Sentinel.Api.Models
{
    public class SharedLink
    {
        public int Id { get; set; }

        public int DocumentId { get; set; }

        [Required]
        public string TokenHash { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public int AccessCount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
