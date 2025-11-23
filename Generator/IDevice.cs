using MongoDB.Bson;

namespace DataGeneration
{
    internal interface IDevice
    {
        ObjectId Id { get; init; }
        string Name { get; init; }
        DeviceType Type { get; init; }
        double GenerateValue(Random random, double min, double max);
    }
}