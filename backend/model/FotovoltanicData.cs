using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Model
{
    public class FotovoltanicData
    {
        [BsonId]
        public ObjectId Id { get; set; } = ObjectId.GenerateNewId();

        public string DeviceName { get; set; }
        public DeviceType DataType { get; set; }

        public DateTimeOffset Timestamp { get; set; }

        public double Data { get; set; }
    }
}
