using System.ComponentModel.DataAnnotations;

namespace Sentinel.Api.Models
{
    public class Document
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        [Required]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public string StoragePath { get; set; } = string.Empty;

        public long FileSize { get; set; }

        [Required]
        public string MimeType { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
