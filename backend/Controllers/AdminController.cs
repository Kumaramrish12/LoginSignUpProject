using Microsoft.AspNetCore.Mvc;
using LoginSignupAPI.Services;
using System.Text.Json;

namespace LoginSignupAPI.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly CouchDbService _couchDbService;

        public AdminController(CouchDbService couchDbService)
        {
            _couchDbService = couchDbService;
        }

        // ================= GET PENDING USERS =================

        [HttpGet("pending-users")]
        public async Task<IActionResult> GetPendingUsers()
        {
            var users = await _couchDbService.GetPendingUsersAsync();

            return Ok(users);
        }

        // ================= APPROVE USER =================

        [HttpPost("approve-user")]
        public async Task<IActionResult> ApproveUser([FromBody] JsonElement data)
        {
            try
            {
                var id = data.GetProperty("_id").GetString();
                var rev = data.GetProperty("_rev").GetString();

                var users = await _couchDbService.GetAllUsersAsync();

                foreach (var user in users)
                {
                    if (user.GetProperty("_id").GetString() == id)
                    {
                        var updatedUser = new
                        {
                            FirstName = user.GetProperty("FirstName").GetString(),
                            LastName = user.GetProperty("LastName").GetString(),
                            Email = user.GetProperty("Email").GetString(),
                            Password = user.GetProperty("Password").GetString(),
                            Role = user.GetProperty("Role").GetString(),
                            IsApproved = true
                        };

                        var success =
                            await _couchDbService.UpdateUserAsync(
                                id,
                                rev,
                                updatedUser
                            );

                        if (success)
                            return Ok(new { message = "User approved successfully" });

                        return StatusCode(500, "Approval failed");
                    }
                }

                return NotFound("User not found");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "Approval error");
            }
        }
    }
}