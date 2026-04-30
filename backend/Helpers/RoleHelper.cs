namespace LoginSignupAPI.Helpers;

public static class RoleHelper
{
    public const string Admin = "Admin";

    public const string User = "User";


    public static bool IsAdmin(string role)
    {
        return role == Admin;
    }


    public static bool IsUser(string role)
    {
        return role == User;
    }
}