using Microsoft.AspNetCore.Mvc;
using LoginSignupAPI.Services;

namespace LoginSignupAPI.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly CouchDbService _couchDbService;

        public UsersController(CouchDbService couchDbService)
        {
            _couchDbService = couchDbService;
        }

        // ✅ GET ALL USER EMAILS FROM COUCHDB
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var emails = await _couchDbService.GetAllUserEmailsAsync();

                return Ok(emails);
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ ERROR: " + ex.Message);
                return StatusCode(500, ex.Message);
            }
        }
    }
}