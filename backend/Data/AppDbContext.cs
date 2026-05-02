using Microsoft.EntityFrameworkCore;
using LoginSignupAPI.Models;

namespace LoginSignupAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // PostgreSQL Messages table (Tab B)
        public DbSet<Message> Messages { get; set; }

        // Users table (Signup + Login + Admin Approval)
        public DbSet<User> Users { get; set; }
    }
}