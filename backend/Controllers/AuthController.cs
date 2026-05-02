using Microsoft.AspNetCore.Mvc;
using LoginSignupAPI.Services;
using System.Text.Json;

namespace LoginSignupAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly CouchDbService _couchDb;

        public AuthController(CouchDbService couchDb)
        {
            _couchDb = couchDb;
        }


        // ================= REGISTER =================

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] JsonElement user)
        {
            try
            {
                if (user.ValueKind == JsonValueKind.Undefined)
                    return BadRequest("Invalid request body");

                var userDict =
                    JsonSerializer.Deserialize<Dictionary<string, object>>(user);

                if (userDict == null)
                    return BadRequest("Invalid data");

                // Remove ConfirmPassword if Angular sends it
                if (userDict.ContainsKey("ConfirmPassword"))
                    userDict.Remove("ConfirmPassword");

                // Always add approval flag
                userDict["IsApproved"] = false;

                var success =
                    await _couchDb.CreateUserAsync(userDict);

                if (!success)
                    return StatusCode(500, "Registration failed");

                return Ok("Registration successful");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        // ================= LOGIN =================

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] JsonElement request)
        {
            try
            {
                string email = "";
                string password = "";

                // Accept email OR Email
                if (request.TryGetProperty("email", out var emailLower))
                    email = emailLower.GetString();

                else if (request.TryGetProperty("Email", out var emailUpper))
                    email = emailUpper.GetString();

                // Accept Password OR password
                if (request.TryGetProperty("Password", out var passUpper))
                    password = passUpper.GetString();

                else if (request.TryGetProperty("password", out var passLower))
                    password = passLower.GetString();

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                    return BadRequest("Email or Password missing");

                var users =
                    await _couchDb.GetAllUsersAsync();

                foreach (var user in users)
                {
                    if (!user.TryGetProperty("Email", out var dbEmailProp))
                        continue;

                    if (!user.TryGetProperty("Password", out var dbPassProp))
                        continue;

                    var dbEmail = dbEmailProp.GetString();
                    var dbPassword = dbPassProp.GetString();

                    if (dbEmail == email && dbPassword == password)
                    {
                        bool approved = false;

                        if (user.TryGetProperty("IsApproved", out var approvedProp))
                            approved = approvedProp.GetBoolean();

                        if (!approved)
                            return Unauthorized("Approval pending");

                        string role = "User";

                        if (user.TryGetProperty("Role", out var roleProp))
                            role = roleProp.GetString();

                        return Ok(new
                        {
                            email = dbEmail,
                            role = role
                        });
                    }
                }

                return Unauthorized("Invalid credentials");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}