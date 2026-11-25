using Microsoft.AspNetCore.Mvc;
using Sentinel.Api.Data;
using Sentinel.Api.Models;

namespace Sentinel.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly SentinelDbContext _context;

        public AuthController(SentinelDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            if (_context.Users.Any(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email is already registered." });
            }

            // Secure password hashing using BCrypt
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = passwordHash,
                Role = "User"
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "User registered successfully." });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // Generate JWT Token (conceptual token string)
            string token = GenerateJwtToken(user);

            // Secure HttpOnly Cookie configuration
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Requires HTTPS in production
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(2)
            };

            Response.Cookies.Append("sentinel_auth_token", token, cookieOptions);

            return Ok(new { message = "Login successful." });
        }

        private string GenerateJwtToken(User user)
        {
            // TODO: Implement actual JWT token generation using Microsoft.IdentityModel.Tokens
            return "mock-jwt-token-for-sentinel";
        }
    }

    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
