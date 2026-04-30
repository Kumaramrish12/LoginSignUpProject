namespace LoginSignupAPI.Models
{
    public class User
    {
        public string? _id { get; set; }

        public string? _rev { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public string Role { get; set; }

        public bool IsApproved { get; set; } = false;
    }
}