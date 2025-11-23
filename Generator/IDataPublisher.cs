using Backend.DataTypes;

namespace DataGeneration
{
    internal interface IDataPublisher
    {
        Task PublishAsync(FotovoltanicData data, CancellationToken cancellationToken);
        Task PublishBatchAsync(IEnumerable<FotovoltanicData> batch, CancellationToken cancellationToken);
    }
}
