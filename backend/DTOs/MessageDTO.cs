namespace LoginSignupAPI.DTOs;

public class MessageDTO
{
    public string SenderEmail { get; set; } = string.Empty;

    public string ReceiverEmail { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;
}