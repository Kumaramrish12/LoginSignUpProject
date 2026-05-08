using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

using LoginSignupAPI.Services;

namespace LoginSignupAPI.Middleware
{
    public class SessionValidationMiddleware
    {
        private readonly RequestDelegate _next;

        public SessionValidationMiddleware(
            RequestDelegate next
        )
        {
            _next = next;
        }

        public async Task InvokeAsync(
            HttpContext context,
            CouchDbService couchDb
        )
        {
            // ================= SKIP PUBLIC ROUTES =================

            var path =
                context.Request.Path.Value?.ToLower();

            if (
                path != null &&
                (
                    path.Contains("/api/auth/login") ||
                    path.Contains("/api/auth/register")
                )
            )
            {
                await _next(context);
                return;
            }

            // ================= GET CLAIMS =================

            var email =
                context.User.FindFirst(
                    ClaimTypes.Email
                )?.Value;

            var sessionId =
                context.User.FindFirst(
                    "sessionId"
                )?.Value;

            var tokenFingerprint =
                context.User.FindFirst(
                    "fingerprint"
                )?.Value;

            // ================= VALIDATE CLAIMS =================

            if (
                string.IsNullOrEmpty(email) ||
                string.IsNullOrEmpty(sessionId)
            )
            {
                await _next(context);
                return;
            }

            // ================= GET USER FROM COUCHDB =================

            var user =
                await couchDb.GetUserByEmailAsync(
                    email
                );

            if (user == null)
            {
                context.Response.StatusCode = 401;

                await context.Response.WriteAsync(
                    "Invalid session"
                );

                return;
            }

            var userDoc = user.Value;

            // ================= GET ACTIVE SESSION =================

            string activeSessionId = "";

            if (
                userDoc.TryGetProperty(
                    "ActiveSessionId",
                    out var sessionProp
                )
            )
            {
                activeSessionId =
                    sessionProp.GetString() ?? "";
            }

            // ================= SESSION CHECK =================

            if (activeSessionId != sessionId)
            {
                context.Response.StatusCode = 401;

                await context.Response.WriteAsync(
                    "Session expired or logged in elsewhere"
                );

                return;
            }

            // ================= BACKEND FINGERPRINT CHECK =================

// ================= OPTIONAL TOKEN CHECK =================

// fingerprint exists inside JWT
// currently used only for device tagging

if (string.IsNullOrEmpty(tokenFingerprint))
{
    context.Response.StatusCode = 401;

    await context.Response.WriteAsync(
        "Invalid fingerprint"
    );

    return;
}

            // ================= SESSION VALID =================

            await _next(context);
        }
    }
}