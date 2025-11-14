using Backend.Model;

namespace Backend.Dtos;

public class DashboardDataDto
{
    public string DeviceName { get; set; }
    public string DataType { get; set; }
    public DateTimeOffset Timestamp { get; set; }
    public double Latest { get; set; }
    public double Average { get; set; }
}