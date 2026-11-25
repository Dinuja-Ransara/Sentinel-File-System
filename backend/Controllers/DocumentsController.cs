using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sentinel.Api.Data;
using Sentinel.Api.Models;

namespace Sentinel.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly SentinelDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly long _maxFileSize = 10 * 1024 * 1024; // 10 MB limit
        private readonly string[] _allowedMimeTypes = { "application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };

        public DocumentsController(SentinelDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            // 1. Enforce file size limit
            if (file.Length > _maxFileSize)
                return BadRequest(new { message = "File size exceeds the 10MB limit." });

            // 2. Validate MIME type
            if (!_allowedMimeTypes.Contains(file.ContentType))
                return BadRequest(new { message = "Invalid file type. Only PDF, images, and Word documents are allowed." });

            // 3. Secure storage path generation (prevent path traversal)
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 4. Save metadata to PostgreSQL database
            var document = new Document
            {
                UserId = 1, // Mocked user ID for now until JWT middleware is hooked up
                FileName = file.FileName,
                StoragePath = filePath,
                FileSize = file.Length,
                MimeType = file.ContentType
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return Ok(new { message = "File uploaded securely.", fileId = document.Id });
        }
    }
}