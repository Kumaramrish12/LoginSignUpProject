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

        // ================= GET ALL PENDING USERS =================

        [HttpGet("pending-users")]
        public async Task<IActionResult> GetPendingUsers()
        {
            var users = await _couchDbService.GetAllUsersAsync();

            var pendingUsers = users
                .Where(user =>
                    user.GetProperty("IsApproved").GetBoolean() == false
                );

            return Ok(pendingUsers);
        }

        // ================= APPROVE USER =================

        [HttpPut("approve-user/{id}")]
        public async Task<IActionResult> ApproveUser(
            string id,
            [FromQuery] string rev
        )
        {
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
                        return Ok("User approved successfully");

                    return StatusCode(500, "Approval failed");
                }
            }

            return NotFound("User not found");
        }

        // ================= REJECT USER =================

        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(
            string id,
            [FromQuery] string rev
        )
        {
            var success =
                await _couchDbService.DeleteUserAsync(id, rev);

            if (success)
                return Ok("User rejected and deleted");

            return StatusCode(500, "Delete failed");
        }
    }
}