using MQTTnet;
using System.Text.Json;

namespace DataGeneration
{
    internal class MqttPublisher(IMqttClient client) : IDataPublisher, IAsyncDisposable
    {
        private readonly IMqttClient _client = client ?? throw new ArgumentNullException(nameof(client));
        public async Task PublishAsync(FotovoltanicData data, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(data);
            var topic = $"fotovolt/{data.DeviceName}/{data.DataType}";
            var payload = new SensorMessagePayload
            {
                Data = data.Data,
                Timestamp = data.Timestamp
            };
            var serializedPayload = JsonSerializer.SerializeToUtf8Bytes(payload);
            var message = new MqttApplicationMessageBuilder()
                .WithTopic(topic)
                .WithPayload(serializedPayload)
                .Build();
            await _client.PublishAsync(message, cancellationToken).ConfigureAwait(false);
        }
        public async Task PublishBatchAsync(IEnumerable<FotovoltanicData> batch, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(batch);
            foreach (var item in batch)
            {
                cancellationToken.ThrowIfCancellationRequested();
                await PublishAsync(item, cancellationToken).ConfigureAwait(false);
            }
        }
        public ValueTask DisposeAsync()
        {
            return default;
        }
    }
}