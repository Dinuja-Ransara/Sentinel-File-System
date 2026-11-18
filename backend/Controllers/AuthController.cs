using Microsoft.AspNetCore.Mvc;

namespace Sentinel.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login()
        { 
            return Ok(new { message = "Auth endpoint placeholder" }); 
        }
    }
}