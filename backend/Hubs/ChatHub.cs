using Microsoft.AspNetCore.SignalR;

namespace LoginSignupAPI.Hubs
{
    public class ChatHub : Hub
    {
        // 🔥 OPTIONAL: Join user group (future use)
        public async Task JoinUser(string email)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, email);
        }

        // 🔥 OPTIONAL: Leave group
        public async Task LeaveUser(string email)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, email);
        }

        // 🔥 SEND MESSAGE TO ALL CONNECTED CLIENTS
        public async Task BroadcastMessage(string sender, string receiver, string message)
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
}