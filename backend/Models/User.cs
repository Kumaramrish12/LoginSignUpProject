using System.ComponentModel.DataAnnotations;

namespace LoginSignupAPI.Models
{
    
    public class User
    {
        [Key]
        public int Id { get; set; }   // REQUIRED PRIMARY KEY

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public string Role { get; set; }

        public bool IsApproved { get; set; } = false;
    }
}