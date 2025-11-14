using System.Text;
using Backend.Dtos;
using Backend.Model;
using MongoDB.Driver;
using MQTTnet;

namespace Backend;

class BackendService
{
    readonly string _mongoDbName = Environment.GetEnvironmentVariable("MONGO_DATABASE") ?? "main";


    private IMqttClient _mqttClient;
    private IMongoClient _mongoClient;

    public IMongoCollection<FotovoltanicData> FotovoltanicDataCollection { get; set; }

    private readonly ILogger<BackendService> _logger;

    public BackendService(IMqttClient mqttClient, IMongoClient mongoClient, ILogger<BackendService> logger)
    {
        _mqttClient = mqttClient;
        _mongoClient = mongoClient;
        _logger = logger;

        FotovoltanicDataCollection = _mongoClient.GetDatabase(_mongoDbName).GetCollection<FotovoltanicData>("FotovoltanicData");
        setupMqtt();

        _logger.LogInformation("BackendService initialized.");
    }

    private void setupMqtt()
    {
        var mqttHost = Environment.GetEnvironmentVariable("MQTT_HOST") ?? "localhost";
        var mqttPort = int.Parse(Environment.GetEnvironmentVariable("MQTT_PORT") ?? "1883");
        var mqttClientId = Environment.GetEnvironmentVariable("MQTT_CLIENT_ID") ?? "MySimpleApi";

        var optionsBuilder = new MqttClientOptionsBuilder()
            .WithClientId(mqttClientId)
            .WithTcpServer(mqttHost, mqttPort)
            .WithCleanSession();

        var options = optionsBuilder.Build();

        _mqttClient.ConnectAsync(options, CancellationToken.None).GetAwaiter().GetResult();
        _mqttClient.SubscribeAsync($"fotovolt/+/+").GetAwaiter().GetResult();
        _mqttClient.ApplicationMessageReceivedAsync += OnMqttMessageReceived;

        _logger.LogInformation($"Connected to MQTT broker at {mqttHost}:{mqttPort}");
    }

    public List<DashboardDataDto> GetDashboardData()
    {
        // Double select to make the enum a string :crying:
        var dashboardData = FotovoltanicDataCollection.AsQueryable()
                    .GroupBy(d => new { d.DeviceName, d.DataType })
                    .Select(g => new 
                    {
                        DeviceName = g.Key.DeviceName,
                        DataType = g.Key.DataType,
                        Timestamp = g.OrderByDescending(d => d.Timestamp).First().Timestamp,
                        Latest = g.OrderByDescending(d => d.Timestamp).First().Data,
                        Average = g.OrderByDescending(d => d.Timestamp)
                                .Take(100)
                                .Average(d => d.Data)
                    })
                    .ToList()
                    .Select(d => new DashboardDataDto
                    {
                        DeviceName = d.DeviceName,
                        DataType = d.DataType.ToString(),
                        Timestamp = d.Timestamp,
                        Latest = d.Latest,
                        Average = d.Average
                    })
                    .ToList();

        return dashboardData;
    }

    private async Task OnMqttMessageReceived(MqttApplicationMessageReceivedEventArgs e)
    {
        FotovoltanicData data = new FotovoltanicData
        {
            DeviceName = e.ApplicationMessage.Topic.Split('/')[1],
            DataType = e.ApplicationMessage.Topic.Split('/')[2] switch
            {
                "Irradiance" => DeviceType.Irradiance,
                "PanelTemp" => DeviceType.PanelTemp,
                "AirTemp" => DeviceType.AirTemp,
                "Power" => DeviceType.Power,
                _ => throw new InvalidOperationException("Unknown data type in topic")
            },
            Timestamp = DateTimeOffset.UtcNow,
            Data = double.Parse(Encoding.UTF8.GetString(e.ApplicationMessage.Payload))
        };

        await FotovoltanicDataCollection.InsertOneAsync(data);
    }
}