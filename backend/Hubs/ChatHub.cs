using Microsoft.AspNetCore.SignalR;

namespace LoginSignupAPI.Hubs;

public class ChatHub : Hub
{
    public async Task SendMessage(string sender, string receiver, string message)
    {
        await Clients.All.SendAsync(
            "ReceiveMessage",
            sender,
            receiver,
            message,
            DateTime.UtcNow
        );
    }
}