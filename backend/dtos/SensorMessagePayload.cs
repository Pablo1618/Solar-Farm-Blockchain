using System.Text.Json.Serialization;

namespace Backend.Dtos
{
    public record SensorMessagePayload
    {
        [JsonPropertyName("timestamp")]
        public DateTimeOffset Timestamp { get; init; }
        [JsonPropertyName("data")]
        public double Data { get; init; }
    }
}
