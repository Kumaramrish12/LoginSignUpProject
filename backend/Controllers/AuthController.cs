using Microsoft.AspNetCore.Mvc;
using LoginSignupAPI.Services;
using System.Text.Json;

namespace LoginSignupAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly CouchDbService _couchDbService;

    public AuthController(CouchDbService couchDbService)
    {
        _couchDbService = couchDbService;
    }

    // ================= REGISTER =================

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] JsonElement user)
    {
        try
        {
            var newUser = new
            {
                FirstName = user.GetProperty("FirstName").GetString(),
                LastName = user.GetProperty("LastName").GetString(),
                Email = user.GetProperty("Email").GetString(),
                Password = user.GetProperty("Password").GetString(),
                Role = user.GetProperty("Role").GetString(),
                IsApproved = false
            };

            var created = await _couchDbService.CreateUserAsync(newUser);

            if (!created)
                return StatusCode(500, new { message = "User creation failed" });

            return Ok(new { message = "User registered successfully" });
        }
        catch
        {
            return StatusCode(500, new { message = "Registration error" });
        }
    }


    // ================= LOGIN =================

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] JsonElement loginData)
    {
        try
        {
            var email = loginData.GetProperty("Email").GetString();
            var password = loginData.GetProperty("Password").GetString();

            var user = await _couchDbService.GetUserByEmailAsync(email);

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            if (user.Value.GetProperty("Password").GetString() != password)
                return Unauthorized(new { message = "Invalid credentials" });

            if (!user.Value.GetProperty("IsApproved").GetBoolean())
                return Unauthorized(new { message = "User not approved yet" });

            var role = user.Value.GetProperty("Role").GetString();

            return Ok(new
            {
                token = "dummy-token",
                role = role
            });
        }
        catch
        {
            return StatusCode(500, new { message = "Login error" });
        }
    }
}