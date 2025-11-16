namespace Backend.Dtos;

public class QueryDataDto
{
    public string DeviceName { get; set; }
    public string DataType { get; set; }
    public DateTimeOffset Timestamp { get; set; }
    public double Data { get; set; }
}