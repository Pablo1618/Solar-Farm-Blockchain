using Backend.DataTypes;
using Backend.Dtos;
using Microsoft.Extensions.Logging;
using MQTTnet;
using System.Text.Json;

namespace DataGeneration
{
    internal class MqttPublisher(IMqttClient client, ILogger<MqttPublisher> logger) : IDataPublisher, IAsyncDisposable
    {
        private readonly IMqttClient _client = client ?? throw new ArgumentNullException(nameof(client));
        private readonly ILogger<MqttPublisher> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
            if (_logger.IsEnabled(LogLevel.Debug))
            {
                _logger.LogDebug("Published {Topic} => {Value}", topic, data.Data);
            }
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