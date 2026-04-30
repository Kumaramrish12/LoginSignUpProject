using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LoginSignupAPI.Models
{
    [Table("Messages")]
    public class Message
    {
        [Key]
        public int Id { get; set; }

        public string SenderEmail { get; set; }

        public string ReceiverEmail { get; set; }   // ← FIXED HERE

        public string Content { get; set; }

        public DateTime Timestamp { get; set; }
    }
}