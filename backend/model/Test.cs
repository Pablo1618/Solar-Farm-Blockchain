using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Test
{
    [BsonId] // Marks as primary key
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
}