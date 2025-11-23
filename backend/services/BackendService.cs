using System.Text;
using Backend.Dtos;
using Backend.DataTypes;
using MongoDB.Driver;
using MQTTnet;
using System.Text.Json;

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

    public async Task<IEnumerable<QueryDataDto>> GetDataAsync(QueryParams query)
    {
        var filter = Builders<FotovoltanicData>.Filter.Empty;

        if (!string.IsNullOrWhiteSpace(query.DeviceName))
            filter &= Builders<FotovoltanicData>.Filter.Eq(x => x.DeviceName, query.DeviceName);

        if (query.DataType.HasValue)
            filter &= Builders<FotovoltanicData>.Filter.Eq(x => x.DataType, query.DataType.Value);

        if (query.From.HasValue)
            filter &= Builders<FotovoltanicData>.Filter.Gte(x => x.Timestamp, query.From.Value);

        if (query.To.HasValue)
            filter &= Builders<FotovoltanicData>.Filter.Lte(x => x.Timestamp, query.To.Value);

        var find = FotovoltanicDataCollection.Find(filter);

        if (!string.IsNullOrWhiteSpace(query.SortBy))
        {
            var sort = query.Desc
                ? Builders<FotovoltanicData>.Sort.Descending(query.SortBy)
                : Builders<FotovoltanicData>.Sort.Ascending(query.SortBy);

            find = find.Sort(sort);
        }

        if (query.Skip.HasValue)
            find = find.Skip(query.Skip.Value);

        if (query.Limit.HasValue)
            find = find.Limit(query.Limit.Value);

        var results = await find.ToListAsync();

        return results.Select(x => new QueryDataDto
            {
                DeviceName = x.DeviceName,
                DataType = x.DataType.ToString(),
                Timestamp = x.Timestamp,
                Data = x.Data
            });
    }

    public async Task<string> GetDataJsonAsync(QueryParams query)
    {
        var data = await GetDataAsync(query);
        return JsonSerializer.Serialize(data, new JsonSerializerOptions
        {
            WriteIndented = true
        });
    }

    public async Task<string> GetDataCsvAsync(QueryParams query)
    {
        var data = await GetDataAsync(query);
        
        var sb = new StringBuilder();
        sb.AppendLine("DeviceName;DataType;Timestamp;Data");

        foreach (var x in data)
        {
            sb.AppendLine(
                $"{x.DeviceName};" +
                $"{x.DataType};" +
                $"{x.Timestamp:O};" +
                $"{x.Data}"
            );
        }

        return sb.ToString();
    }


    private async Task OnMqttMessageReceived(MqttApplicationMessageReceivedEventArgs e)
    {
        var payload = JsonSerializer.Deserialize<SensorMessagePayload>(
            Encoding.UTF8.GetString(e.ApplicationMessage.Payload))!;
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
            Timestamp = payload.Timestamp,
            Data = payload.Data
        };

        await FotovoltanicDataCollection.InsertOneAsync(data);
    }
}