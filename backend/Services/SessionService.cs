namespace LoginSignupAPI.Services;

public static class SessionService
{
    // Stores active logged-in users
    public static Dictionary<string, string> ActiveUsers
        = new Dictionary<string, string>();


    // Check if user already logged in
    public static bool IsUserLoggedIn(string email)
    {
        return ActiveUsers.ContainsKey(email);
    }


    // Add session
    public static void AddUserSession(string email, string token)
    {
        if (!ActiveUsers.ContainsKey(email))
        {
            ActiveUsers[email] = token;
        }
    }


    // Remove session
    public static void RemoveUserSession(string email)
    {
        if (ActiveUsers.ContainsKey(email))
        {
            ActiveUsers.Remove(email);
        }
    }
}