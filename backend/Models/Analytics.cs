namespace LoginSignupAPI.Models;

public class Analytics
{
    // Event category (login, approval, message, etc.)
    public string Category { get; set; } = string.Empty;

    // Event timestamp
    public DateTime Timestamp { get; set; } = DateTime.Now;
}