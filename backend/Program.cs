using LoginSignupAPI.Services;
using LoginSignupAPI.Data;
using LoginSignupAPI.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

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


// ================= CORS (FINAL FIX) =================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200") // 🔥 FIXED (no wildcard)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // required for SignalR
    });
});


var app = builder.Build();


// ================= MIDDLEWARE =================
app.UseSwagger();
app.UseSwaggerUI();

app.UseRouting(); // ✅ IMPORTANT (missing before)

app.UseCors("AllowAngular"); // ✅ MUST BE AFTER routing

app.UseAuthorization();


// ================= ENDPOINTS =================
app.MapControllers();

app.MapHub<ChatHub>("/chatHub"); // SignalR endpoint


app.Run();