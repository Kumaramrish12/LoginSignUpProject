using Microsoft.AspNetCore.Mvc;
using LoginSignupAPI.Data;
using LoginSignupAPI.Models;

namespace LoginSignupAPI.Controllers
{
    [ApiController]
    [Route("api/chat")]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context)
        {
            _context = context;
        }


        // ================= SEND MESSAGE =================

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage(Message message)
        {
            try
            {
                if (message == null)
                    return BadRequest("Invalid message");

                // Ignore client-provided ID (EF auto-generates it)
                message.Id = 0;

                // Always set timestamp from server
                message.Timestamp = DateTime.UtcNow;


                // ================= BROADCAST SUPPORT =================

                if (!string.IsNullOrEmpty(message.ReceiverEmail) &&
                    message.ReceiverEmail.ToLower() == "all")
                {
                    var users = new List<string>
                    {
                        "rahul@test.com",
                        "admin@test.com",
                        "royamrish.18@gmail.com"
                    };

                    foreach (var user in users)
                    {
                        var msg = new Message
                        {
                            SenderEmail = message.SenderEmail,
                            ReceiverEmail = user,
                            Content = message.Content,
                            Timestamp = DateTime.UtcNow
                        };

                        _context.Messages.Add(msg);
                    }
                }
                else
                {
                    _context.Messages.Add(message);
                }


                await _context.SaveChangesAsync();

                return Ok("Message stored successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ex.InnerException?.Message ?? ex.Message
                );
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