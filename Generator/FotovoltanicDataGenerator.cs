namespace DataGeneration
{
    internal class FotovoltanicDataGenerator(IDevice device, Random random, DateTimeOffset startTimestamp, TimeSpan interval,
        double minValue, double maxValue)
    {
        public IDevice Device { get; init; } = device;
        public Random Random { get; init; } = random;
        public DateTimeOffset StartTimestamp { get; init; } = startTimestamp;
        public TimeSpan Interval { get; init; } = interval;
        public DateTimeOffset Timestamp { get; private set; } = startTimestamp;
        public double MinValue { get; init; } = minValue;
        public double MaxValue { get; init; } = maxValue;

        public FotovoltanicDataGenerator(IDevice device, DateTimeOffset startTimestamp, TimeSpan interval, double minValue,
            double maxValue)
            : this(device, new Random(), startTimestamp, interval, minValue, maxValue)
        {
        }
        public FotovoltanicData Generate()
        {
            var data = new FotovoltanicData
            {
                DeviceName = Device.Name,
                DataType = Device.Type,
                Timestamp = Timestamp,
                Data = Device.GenerateValue(Random, MinValue, MaxValue)
            };
            Timestamp += Interval;
            return data;
        }
        public IEnumerable<FotovoltanicData> GenerateBatch(int count)
        {
            for (int i = 0; i < count; i++)
            {
                yield return Generate();
            }
        }
    }
}
