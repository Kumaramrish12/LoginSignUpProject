using Microsoft.AspNetCore.Mvc;
using LoginSignupAPI.Services;
using System.Text.Json;

namespace LoginSignupAPI.Controllers
{
    [Route("api/admin")]
    [ApiController]
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
            try
            {
                var users = await _couchDbService.GetAllUsersAsync();

                var pendingUsers = users
                    .Where(u =>
                        u.TryGetProperty("IsApproved", out var approved)
                        && approved.GetBoolean() == false
                    )
                    .Select(u => new
                    {
                        _id = u.GetProperty("_id").GetString(),
                        _rev = u.GetProperty("_rev").GetString(),

                        FirstName = u.TryGetProperty("FirstName", out var fn)
                            ? fn.GetString()
                            : "",

                        Email = u.TryGetProperty("Email", out var em)
                            ? em.GetString()
                            : "",

                        Role = u.TryGetProperty("Role", out var rl)
                            ? rl.GetString()
                            : ""
                    })
                    .ToList();

                return Ok(pendingUsers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        // ================= APPROVE USER =================

        [HttpPut("approve-user/{id}")]
        public async Task<IActionResult> ApproveUser(string id)
        {
            var users = await _couchDbService.GetAllUsersAsync();

            var user = users.FirstOrDefault(u =>
                u.GetProperty("_id").GetString() == id
            );

            if (user.ValueKind == JsonValueKind.Undefined)
                return NotFound();

            var updatedUser = new
            {
                FirstName = user.GetProperty("FirstName").GetString(),
                LastName = user.GetProperty("LastName").GetString(),
                Email = user.GetProperty("Email").GetString(),
                Password = user.GetProperty("Password").GetString(),
                ConfirmPassword = user.GetProperty("ConfirmPassword").GetString(),
                Role = user.GetProperty("Role").GetString(),
                IsApproved = true
            };

            await _couchDbService.UpdateUserAsync(
                id,
                user.GetProperty("_rev").GetString(),
                updatedUser
            );

            return Ok();
        }


        // ================= DELETE USER =================

        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var users = await _couchDbService.GetAllUsersAsync();

            var user = users.FirstOrDefault(u =>
                u.GetProperty("_id").GetString() == id
            );

            if (user.ValueKind == JsonValueKind.Undefined)
                return NotFound();

            await _couchDbService.DeleteUserAsync(
                id,
                user.GetProperty("_rev").GetString()
            );

            return Ok();
        }
    }
}