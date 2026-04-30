using LoginSignupAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace LoginSignupAPI.Controllers;

[Route("api/dashboard")]
[ApiController]
public class DashboardController : ControllerBase
{
    private readonly UserStoreService _userStore;

    public DashboardController(UserStoreService userStore)
    {
        _userStore = userStore;
    }


    // =========================
    // GET TOTAL USERS COUNT
    // =========================
    [HttpGet("total-users")]
    public IActionResult GetTotalUsers()
    {
        var count = _userStore.Users.Count;

        return Ok(new
        {
            totalUsers = count
        });
    }


    // =========================
    // GET APPROVED USERS COUNT
    // =========================
    [HttpGet("approved-users")]
    public IActionResult GetApprovedUsersCount()
    {
        var count = _userStore.Users
            .Count(u => u.IsApproved);

        return Ok(new
        {
            approvedUsers = count
        });
    }


    // =========================
    // GET PENDING USERS COUNT
    // =========================
    [HttpGet("pending-users")]
    public IActionResult GetPendingUsersCount()
    {
        var count = _userStore.Users
            .Count(u => !u.IsApproved);

        return Ok(new
        {
            pendingUsers = count
        });
    }


    // =========================
    // GET ACTIVE SESSION COUNT
    // =========================
    [HttpGet("active-sessions")]
    public IActionResult GetActiveSessions()
    {
        var count = SessionService.ActiveUsers.Count;

        return Ok(new
        {
            activeSessions = count
        });
    }
}