using Microsoft.AspNetCore.Mvc;
using LoginSignupAPI.Data;
using LoginSignupAPI.Models;
using Microsoft.AspNetCore.SignalR;
using LoginSignupAPI.Hubs;

namespace LoginSignupAPI.Controllers
{
    [ApiController]
    [Route("api/chat")]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<ChatHub> _hub;

        // ✅ Inject DB + SignalR Hub
        public ChatController(AppDbContext context, IHubContext<ChatHub> hub)
        {
            _context = context;
            _hub = hub;
        }

        // ================= SEND MESSAGE =================

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage(Message message)
        {
            try
            {
                Console.WriteLine("🔥 API HIT");
                Console.WriteLine("Receiver: " + message?.ReceiverEmail);

                if (message == null)
                    return BadRequest("Invalid message");

                message.Id = 0;
                message.Timestamp = DateTime.UtcNow;

                var receiver = message.ReceiverEmail?.ToLower();

                // ================= BROADCAST: USERS =================
                if (receiver == "all users" || receiver == "users")
                {
                    var users = _context.Users.ToList();

                    foreach (var user in users)
                    {
                        var msg = new Message
                        {
                            SenderEmail = message.SenderEmail,
                            ReceiverEmail = user.Email,
                            Content = message.Content,
                            Timestamp = DateTime.UtcNow
                        };

                        _context.Messages.Add(msg);
                    }
                }

                // ================= BROADCAST: ADMINS =================
                else if (receiver == "admins")
                {
                    var admins = _context.Users
                        .Where(u => u.Role == "Admin")
                        .ToList();

                    foreach (var admin in admins)
                    {
                        var msg = new Message
                        {
                            SenderEmail = message.SenderEmail,
                            ReceiverEmail = admin.Email,
                            Content = message.Content,
                            Timestamp = DateTime.UtcNow
                        };

                        _context.Messages.Add(msg);
                    }
                }

                // ================= DIRECT MESSAGE =================
                else
                {
                    _context.Messages.Add(message);
                }

                await _context.SaveChangesAsync();

                // 🔥🔥🔥 THIS WAS MISSING (REAL-TIME TRIGGER)
                await _hub.Clients.All.SendAsync("ReceiveMessage");

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ ERROR: " + ex.Message);
                return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
            }
        }

        // ================= GET ALL MESSAGES =================

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