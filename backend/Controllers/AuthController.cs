using Microsoft.AspNetCore.Mvc;
using LoginSignupAPI.Services;
using System.Text.Json;

using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LoginSignupAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly CouchDbService _couchDb;

        // ✅ JWT CONFIG
        private readonly IConfiguration _configuration;

        public AuthController(
            CouchDbService couchDb,
            IConfiguration configuration
        )
        {
            _couchDb = couchDb;
            _configuration = configuration;
        }

        // ================= REGISTER =================

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] JsonElement user
        )
        {
            try
            {
                if (
                    user.ValueKind ==
                    JsonValueKind.Undefined
                )
                    return BadRequest(
                        "Invalid request body"
                    );

                var userDict =
                    JsonSerializer.Deserialize
                    <Dictionary<string, object>>(user);

                if (userDict == null)
                    return BadRequest(
                        "Invalid data"
                    );

                // remove confirm password
                if (
                    userDict.ContainsKey(
                        "ConfirmPassword"
                    )
                )
                {
                    userDict.Remove(
                        "ConfirmPassword"
                    );
                }

                // approval flag
                userDict["IsApproved"] = false;

                var success =
                    await _couchDb
                    .CreateUserAsync(userDict);

                if (!success)
                {
                    return StatusCode(
                        500,
                        "Registration failed"
                    );
                }

                return Ok(
                    "Registration successful"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ex.Message
                );
            }
        }

        // ================= LOGIN =================

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] JsonElement request
        )
        {
            try
            {
                string email = "";
                string password = "";
                string fingerprint = "";

                // ================= EMAIL =================

                if (
                    request.TryGetProperty(
                        "email",
                        out var emailLower
                    )
                )
                {
                    email =
                        emailLower.GetString() ?? "";
                }
                else if (
                    request.TryGetProperty(
                        "Email",
                        out var emailUpper
                    )
                )
                {
                    email =
                        emailUpper.GetString() ?? "";
                }

                // ================= PASSWORD =================

                if (
                    request.TryGetProperty(
                        "Password",
                        out var passUpper
                    )
                )
                {
                    password =
                        passUpper.GetString() ?? "";
                }
                else if (
                    request.TryGetProperty(
                        "password",
                        out var passLower
                    )
                )
                {
                    password =
                        passLower.GetString() ?? "";
                }

                // ================= FINGERPRINT =================

                if (
                    request.TryGetProperty(
                        "fingerprint",
                        out var fpProp
                    )
                )
                {
                    fingerprint =
                        fpProp.GetString() ?? "";
                }

                if (
                    string.IsNullOrEmpty(email) ||
                    string.IsNullOrEmpty(password)
                )
                {
                    return BadRequest(
                        "Email or Password missing"
                    );
                }

                var users =
                    await _couchDb
                    .GetAllUsersAsync();

                foreach (var user in users)
                {
                    if (
                        !user.TryGetProperty(
                            "Email",
                            out var dbEmailProp
                        )
                    )
                        continue;

                    if (
                        !user.TryGetProperty(
                            "Password",
                            out var dbPassProp
                        )
                    )
                        continue;

                    var dbEmail =
                        dbEmailProp.GetString();

                    var dbPassword =
                        dbPassProp.GetString();

                    if (
                        dbEmail == email &&
                        dbPassword == password
                    )
                    {
                        bool approved = false;

                        if (
                            user.TryGetProperty(
                                "IsApproved",
                                out var approvedProp
                            )
                        )
                        {
                            approved =
                                approvedProp.GetBoolean();
                        }

                        if (!approved)
                        {
                            return Unauthorized(
                                "Approval pending"
                            );
                        }

                        // ================= ROLE =================

                        string role = "User";

                        if (
                            user.TryGetProperty(
                                "Role",
                                out var roleProp
                            )
                        )
                        {
                            role =
                                roleProp.GetString()
                                ?? "User";
                        }

                        // ================= SESSION =================

                        var sessionId =
                            Guid.NewGuid()
                            .ToString();

                        // ✅ SAVE ACTIVE SESSION
                        await _couchDb
                        .UpdateActiveSessionAsync(
                            dbEmail ?? "",
                            sessionId
                        );

                        // ================= JWT CLAIMS =================

                        var claims = new[]
                        {
                            new Claim(
                                ClaimTypes.Email,
                                dbEmail ?? ""
                            ),

                            new Claim(
                                ClaimTypes.Role,
                                role
                            ),

                            // ✅ SESSION CLAIM
                            new Claim(
                                "sessionId",
                                sessionId
                            ),

                            // ✅ FINGERPRINT CLAIM
                            new Claim(
                                "fingerprint",
                                fingerprint
                            )
                        };

                        // ================= JWT KEY =================

                        var key =
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(
                                    _configuration[
                                        "Jwt:Key"
                                    ] ?? ""
                                )
                            );

                        var creds =
                            new SigningCredentials(
                                key,
                                SecurityAlgorithms
                                .HmacSha256
                            );

                        // ================= JWT TOKEN =================

                        var token =
                            new JwtSecurityToken(

                                issuer:
                                    _configuration[
                                        "Jwt:Issuer"
                                    ],

                                audience:
                                    _configuration[
                                        "Jwt:Audience"
                                    ],

                                claims: claims,

                                expires:
                                    DateTime.Now
                                    .AddHours(2),

                                signingCredentials:
                                    creds
                            );

                        var jwt =
                            new JwtSecurityTokenHandler()
                            .WriteToken(token);

                        // ================= RESPONSE =================

                        return Ok(new
                        {
                            token = jwt,

                            sessionId = sessionId,

                            email = dbEmail,

                            role = role
                        });
                    }
                }

                return Unauthorized(
                    "Invalid credentials"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ex.Message
                );
            }
        }
    }
}