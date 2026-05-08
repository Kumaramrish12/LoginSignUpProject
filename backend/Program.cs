using LoginSignupAPI.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using LoginSignupAPI.Services;
using LoginSignupAPI.Data;
using LoginSignupAPI.Hubs;

using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ================= JWT AUTHENTICATION =================

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    builder.Configuration["Jwt:Issuer"],

                ValidAudience =
                    builder.Configuration["Jwt:Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            builder.Configuration["Jwt:Key"]
                        )
                    )
            };
    });

builder.Services.AddAuthorization();

// ================= LOGGING =================

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Debug);

// ================= POSTGRESQL =================

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// ================= COUCHDB =================

builder.Services.AddHttpClient<CouchDbService>();

// ================= CONTROLLERS =================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ================= SIGNALR =================

builder.Services.AddSignalR();

// ================= CORS =================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// ================= MIDDLEWARE =================

app.UseSwagger();
app.UseSwaggerUI();

app.UseRouting();

app.UseCors("AllowAngular");

// ✅ IMPORTANT FOR JWT
app.UseAuthentication();

// ✅ SESSION VALIDATION
app.UseMiddleware<SessionValidationMiddleware>();

app.UseAuthorization();

// ================= ENDPOINTS =================

app.MapControllers();

app.MapHub<ChatHub>("/chatHub");

// ================= RUN =================

app.Run();