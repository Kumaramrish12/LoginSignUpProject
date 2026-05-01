using Microsoft.AspNetCore.Mvc;
using LoginSignupAPI.Services;
using System.Text.Json;

namespace LoginSignupAPI.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly CouchDbService _couchDbService;

        public DashboardController(CouchDbService couchDbService)
        {
            _couchDbService = couchDbService;
        }

        [HttpGet("total-users")]
        public async Task<IActionResult> GetTotalUsers()
        {
            try
            {
                var users = await _couchDbService.GetAllUsersAsync();

                int totalAdmins = 0;
                int totalUsers = 0;
                int pendingUsers = 0;

                foreach (var user in users)
                {
                    string role = "";
                    bool approved = false;

                    // handle BOTH formats safely
                    if (user.TryGetProperty("role", out var roleLower))
                        role = roleLower.GetString();

                    else if (user.TryGetProperty("Role", out var roleUpper))
                        role = roleUpper.GetString();

                    if (user.TryGetProperty("isApproved", out var approvedLower))
                        approved = approvedLower.GetBoolean();

                    else if (user.TryGetProperty("IsApproved", out var approvedUpper))
                        approved = approvedUpper.GetBoolean();


                    if (role == "Admin")
                        totalAdmins++;

                    if (role == "User")
                        totalUsers++;

                    if (!approved)
                        pendingUsers++;
                }

                return Ok(new
                {
                    totalAdmins,
                    totalUsers,
                    pendingUsers
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}