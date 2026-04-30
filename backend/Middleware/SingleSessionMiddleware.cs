using LoginSignupAPI.Services;
using System.Security.Claims;

namespace LoginSignupAPI.Middleware;

public class SingleSessionMiddleware
{
    private readonly RequestDelegate _next;

    public SingleSessionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Check if request contains JWT token
        if (context.User.Identity != null &&
            context.User.Identity.IsAuthenticated)
        {
            var email =
                context.User.FindFirst(ClaimTypes.Email)?.Value;

            if (!string.IsNullOrEmpty(email))
            {
                // If session not found in active users list → block access
                if (!SessionService.ActiveUsers.ContainsKey(email))
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync(
                        "Session expired or already active elsewhere"
                    );
                    return;
                }
            }
        }

        await _next(context);
    }
}