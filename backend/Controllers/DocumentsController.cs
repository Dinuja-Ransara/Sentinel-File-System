using Microsoft.AspNetCore.Mvc;

namespace Sentinel.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetDocuments()
        { 
            return Ok(new { documents = new string[] {} }); 
        }
    }
}