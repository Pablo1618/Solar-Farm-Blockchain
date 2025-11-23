using Backend.DataTypes;
using Microsoft.Extensions.Logging;
using MQTTnet;
using System.Globalization;
using System.Text;

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
            var payload = Encoding.UTF8.GetBytes(data.Data.ToString("G", CultureInfo.InvariantCulture));
            var message = new MqttApplicationMessageBuilder()
                .WithTopic(topic)
                .WithPayload(payload)
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