using Microsoft.EntityFrameworkCore;
using LoginSignupAPI.Models;

namespace LoginSignupAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options
        ) : base(options)
        {
        }

        public DbSet<Message> Messages { get; set; }
    }
}