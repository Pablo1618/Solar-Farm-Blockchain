using MongoDB.Bson;

namespace DataGeneration
{
    internal class AirTempDevice : IDevice
    {
        public required ObjectId Id { get; init; }
        public required string Name { get; init; }
        public required DeviceType Type { get; init; }
        public double GenerateValue(Random random, double min, double max)
        {
            ArgumentNullException.ThrowIfNull(random);
            if (min > max)
            {
                throw new ArgumentException("Minimum value cannot be higher than maximum value");
            }
            return random.NextDouble() * (max - min) + min;
        }
    }
}
