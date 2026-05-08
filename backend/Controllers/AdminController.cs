using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LoginSignupAPI.Services;
using System.Text.Json;

namespace LoginSignupAPI.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly CouchDbService _couchDbService;

        public AdminController(CouchDbService couchDbService)
        {
            _couchDbService = couchDbService;
        }


        // ================= SAFE PROPERTY READER =================

        private string GetString(JsonElement element, string propertyName)
        {
            foreach (var prop in element.EnumerateObject())
            {
                if (prop.Name.Equals(propertyName,
                    StringComparison.OrdinalIgnoreCase))
                {
                    return prop.Value.GetString();
                }
            }

            return "";
        }

        private bool GetBool(JsonElement element, string propertyName)
        {
            foreach (var prop in element.EnumerateObject())
            {
                if (prop.Name.Equals(propertyName,
                    StringComparison.OrdinalIgnoreCase))
                {
                    return prop.Value.GetBoolean();
                }
            }

            return false;
        }


        // ================= GET PENDING USERS =================

        [HttpGet("pending-users")]
        public async Task<IActionResult> GetPendingUsers()
        {
            try
            {
                var users = await _couchDbService.GetAllUsersAsync();

                var pendingUsers = users
                    .Where(u => GetBool(u, "IsApproved") == false)
                    .Select(u => new
                    {
                        _id = GetString(u, "_id"),
                        _rev = GetString(u, "_rev"),

                        firstName = GetString(u, "FirstName"),
                        email = GetString(u, "Email"),
                        role = GetString(u, "Role")
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
                GetString(u, "_id") == id
            );

            if (user.ValueKind == JsonValueKind.Undefined)
                return NotFound("User not found");

            var updatedUser =
                JsonSerializer.Deserialize<Dictionary<string, object>>(user.ToString());

            updatedUser["IsApproved"] = true;

            var success = await _couchDbService.UpdateUserAsync(
                id,
                GetString(user, "_rev"),
                updatedUser
            );

            return success
                ? Ok("User approved successfully")
                : BadRequest("Approval failed");
        }


        // ================= DELETE USER =================

        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var users = await _couchDbService.GetAllUsersAsync();

            var user = users.FirstOrDefault(u =>
                GetString(u, "_id") == id
            );

            if (user.ValueKind == JsonValueKind.Undefined)
                return NotFound("User not found");

            var success = await _couchDbService.DeleteUserAsync(
                id,
                GetString(user, "_rev")
            );

            return success
                ? Ok("User deleted successfully")
                : BadRequest("Delete failed");
        }
    }
}