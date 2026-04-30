using Microsoft.AspNetCore.Mvc;
using LoginSignupAPI.Services;
using System.Text.Json;

namespace LoginSignupAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly CouchDbService _couchDbService;

        public AuthController(CouchDbService couchDbService)
        {
            _couchDbService = couchDbService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] JsonElement data)
        {
            Console.WriteLine("LOGIN API HIT");

            string email = "";
            string password = "";

            if (data.TryGetProperty("Email", out var e1))
                email = e1.GetString();

            if (data.TryGetProperty("email", out var e2))
                email = e2.GetString();

            if (data.TryGetProperty("Password", out var p1))
                password = p1.GetString();

            if (data.TryGetProperty("password", out var p2))
                password = p2.GetString();

            Console.WriteLine($"EMAIL RECEIVED: {email}");
            Console.WriteLine($"PASSWORD RECEIVED: {password}");

            var users = await _couchDbService.GetAllUsersAsync();

            Console.WriteLine($"TOTAL USERS FOUND: {users.Count}");

            foreach (var user in users)
            {
                // Skip invalid docs safely
                if (!user.TryGetProperty("Email", out var dbEmailProp))
                    continue;

                if (!user.TryGetProperty("Password", out var dbPasswordProp))
                    continue;

                if (!user.TryGetProperty("IsApproved", out var approvedProp))
                    continue;

                if (!user.TryGetProperty("Role", out var roleProp))
                    continue;

                var dbEmail = dbEmailProp.GetString();
                var dbPassword = dbPasswordProp.GetString();
                var approved = approvedProp.GetBoolean();

                Console.WriteLine($"CHECKING USER: {dbEmail}");

                if (dbEmail == email && dbPassword == password)
                {
                    if (!approved)
                    {
                        Console.WriteLine("USER NOT APPROVED");
                        return Unauthorized("Approval pending");
                    }

                    Console.WriteLine("LOGIN SUCCESS");

                    return Ok(new
                    {
                        email = dbEmail,
                        role = roleProp.GetString()
                    });
                }
            }

            Console.WriteLine("NO MATCH FOUND");

            return Unauthorized("Invalid credentials");
        }
    }
}