using Microsoft.AspNetCore.Mvc;
using Sentinel.Api.Data;
using Sentinel.Api.Models;
using System.Security.Cryptography;

namespace Sentinel.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShareController : ControllerBase
    {
        private readonly SentinelDbContext _context;

        public ShareController(SentinelDbContext context)
        {
            _context = context;
        }

        [HttpPost("generate/{documentId}")]
        public IActionResult GenerateShareLink(int documentId, [FromBody] ShareRequestDto dto)
        {
            var document = _context.Documents.Find(documentId);
            if (document == null)
                return NotFound(new { message = "Document not found." });

            // Generate a cryptographically secure random token
            var tokenBytes = RandomNumberGenerator.GetBytes(32);
            var token = Convert.ToBase64String(tokenBytes)
                .Replace("+", "-").Replace("/", "_").Replace("=", ""); // URL-safe base64

            var sharedLink = new SharedLink
            {
                DocumentId = documentId,
                TokenHash = token,
                ExpiresAt = DateTime.UtcNow.AddHours(dto.ExpirationHours > 0 ? dto.ExpirationHours : 24),
                AccessCount = 0
            };

            _context.SharedLinks.Add(sharedLink);
            _context.SaveChanges();

            var shareUrl = $"{Request.Scheme}://{Request.Host}/api/share/download/{token}";

            return Ok(new { shareUrl, expiresAt = sharedLink.ExpiresAt });
        }

        [HttpGet("download/{token}")]
        public IActionResult DownloadSharedFile(string token)
        {
            var sharedLink = _context.SharedLinks.FirstOrDefault(s => s.TokenHash == token);
            if (sharedLink == null || sharedLink.ExpiresAt < DateTime.UtcNow)
                return Unauthorized(new { message = "Invalid or expired share link." });

            var document = _context.Documents.Find(sharedLink.DocumentId);
            if (document == null || !System.IO.File.Exists(document.StoragePath))
                return NotFound(new { message = "File no longer exists on server." });

            // Increment access count
            sharedLink.AccessCount++;
            _context.SaveChanges();

            var fileBytes = System.IO.File.ReadAllBytes(document.StoragePath);
            return File(fileBytes, document.MimeType, document.FileName);
        }
    }

    public class ShareRequestDto
    {
        public int ExpirationHours { get; set; } = 24;
    }
}