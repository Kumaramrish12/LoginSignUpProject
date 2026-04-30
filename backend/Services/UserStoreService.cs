using LoginSignupAPI.Models;

namespace LoginSignupAPI.Services;

public class UserStoreService
{
    // Shared in-memory storage for users
    public List<User> Users { get; set; } = new List<User>();
}