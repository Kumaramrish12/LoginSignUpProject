using LoginSignupAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace LoginSignupAPI.Controllers;

[Route("api/analytics")]
[ApiController]
public class AnalyticsController : ControllerBase
{
    // Temporary in-memory analytics storage
    private static List<Analytics> analyticsData = new List<Analytics>();


    // =========================
    // RECORD EVENT
    // =========================
    [HttpPost("record")]
    public IActionResult RecordEvent(string category)
    {
        var entry = new Analytics
        {
            Category = category,
            Timestamp = DateTime.Now
        };

        analyticsData.Add(entry);

        return Ok("Event recorded successfully");
    }


    // =========================
    // GET ALL EVENTS
    // =========================
    [HttpGet("all")]
    public IActionResult GetAllEvents()
    {
        return Ok(analyticsData);
    }


    // =========================
    // GET EVENT COUNT BY CATEGORY
    // =========================
    [HttpGet("count/{category}")]
    public IActionResult GetCategoryCount(string category)
    {
        var count = analyticsData
            .Count(a => a.Category == category);

        return Ok(new
        {
            category,
            count
        });
    }


    // =========================
    // GET TOTAL EVENT COUNT
    // =========================
    [HttpGet("total")]
    public IActionResult GetTotalEvents()
    {
        return Ok(new
        {
            totalEvents = analyticsData.Count
        });
    }
}