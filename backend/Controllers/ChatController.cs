using Microsoft.AspNetCore.Mvc;
using LoginSignupAPI.Data;
using LoginSignupAPI.Models;
using Microsoft.AspNetCore.SignalR;
using LoginSignupAPI.Hubs;
using LoginSignupAPI.Services;

namespace LoginSignupAPI.Controllers
{
    [ApiController]
    [Route("api/chat")]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<ChatHub> _hub;
        private readonly CouchDbService _couch;

        public ChatController(
            AppDbContext context,
            IHubContext<ChatHub> hub,
            CouchDbService couch
        )
        {
            _context = context;
            _hub = hub;
            _couch = couch;
        }

        // ================= SEND MESSAGE =================

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage(Message message)
        {
            try
            {
                if (message == null)
                    return BadRequest("Invalid message");

                message.Id = 0;
                message.Timestamp = DateTime.UtcNow;

                var receiver = message.ReceiverEmail?.ToLower();

                // ================= ALL USERS =================
                if (receiver == "all users" || receiver == "users")
                {
                    var users = await _couch.GetAllUsersAsync();

                    foreach (var user in users)
                    {
                        var email = user.GetProperty("Email").GetString();
                        var approved = user.GetProperty("IsApproved").GetBoolean();

                        if (!approved) continue;

                        var msg = new Message
                        {
                            SenderEmail = message.SenderEmail,
                            ReceiverEmail = email,
                            Content = message.Content,
                            Timestamp = DateTime.UtcNow
                        };

                        _context.Messages.Add(msg);
                    }
                }

                // ================= ADMIN =================
                else if (receiver == "admins")
                {
                    var adminEmail = "admin@test.com"; // ✅ your only admin

                    var msg = new Message
                    {
                        SenderEmail = message.SenderEmail,
                        ReceiverEmail = adminEmail,
                        Content = message.Content,
                        Timestamp = DateTime.UtcNow
                    };

                    _context.Messages.Add(msg);
                }

                // ================= DIRECT =================
                else
                {
                    _context.Messages.Add(message);
                }

                await _context.SaveChangesAsync();

                // 🔥 Optional real-time
                await _hub.Clients.All.SendAsync("ReceiveMessage");

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ ERROR: " + ex.Message);
                return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
            }
        }

        // ================= GET MESSAGES =================

        [HttpGet("messages")]
        public IActionResult GetMessages()
        {
            try
            {
                var messages = _context.Messages
                    .OrderByDescending(m => m.Timestamp)
                    .ToList();

                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ex.InnerException?.Message ?? ex.Message
                );
            }
        }
    }
}