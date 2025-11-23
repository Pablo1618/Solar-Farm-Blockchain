using MongoDB.Bson;

namespace DataGeneration
{
    internal static class DeviceFactory
    {
        public static IDevice Create(string name, DeviceType type)
        {
            return new IrradianceDevice
            {
                Id = ObjectId.GenerateNewId(),
                Name = name,
                Type = type
            };
        }
        public static IDevice Create(ObjectId id, string name, DeviceType type)
        {
            return new IrradianceDevice
            {
                Id = id,
                Name = name,
                Type = type
            };
        }
    }
}
