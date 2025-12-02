using System.Text;
using Backend.Dtos;
using Backend.DataTypes;
using MongoDB.Driver;
using MQTTnet;
using System.Text.Json;
using SolarFarmBackend.blockchain;
using SolarFarmBackend.dtos;

namespace Backend;

class BackendService
{
    readonly string _mongoDbName = Environment.GetEnvironmentVariable("MONGO_DATABASE") ?? "main";


    private IMqttClient _mqttClient;
    private IMongoClient _mongoClient;
    private BlockchainService _blockchainService;

    public IMongoCollection<FotovoltanicData> FotovoltanicDataCollection { get; set; }

    private readonly ILogger<BackendService> _logger;

    public BackendService(IMqttClient mqttClient, IMongoClient mongoClient, ILogger<BackendService> logger, BlockchainService blockchainService)
    {
        _mqttClient = mqttClient;
        _mongoClient = mongoClient;
        _blockchainService = blockchainService;
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

    public async Task<List<BlockchainWalletListViewDTO>> GetBlockchainWalletListData()
    {
        // Double select to make the enum a string :crying:
        var blockchainWalletArrayData = FotovoltanicDataCollection.AsQueryable()
                    .GroupBy(d => new { d.DeviceName, d.DataType })
                    .Select(g => new
                    {
                        DeviceName = g.Key.DeviceName,
                        DataType = g.Key.DataType,
                    })
                    .ToList()
                    .Select(async (d) =>
                    {
                        var deviceUniqueName = d.DataType.ToString() + "_" + d.DeviceName.ToString();
                        var account = _blockchainService.StringToAccount(deviceUniqueName);
                        var tokenAmount = await _blockchainService.GetAccountBalance(account.Address);
                        return new BlockchainWalletListViewDTO
                        {
                            dataType_deviceName = deviceUniqueName,
                            walletAddress = account.Address,
                            tokenBalance = tokenAmount.ToString()
                        };
                    })
                    .ToArray();
        await Task.WhenAll(blockchainWalletArrayData);

        var blockchainWalletListData = blockchainWalletArrayData.Select((t) => t.Result).ToList();
        blockchainWalletListData.Sort((a,b) => { return a.dataType_deviceName.CompareTo(b.dataType_deviceName); });
        return blockchainWalletListData;
    }

    private FilterDefinition<FotovoltanicData> BuildFilter(QueryParams query)
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

        return filter;
    }

    public async Task<long> GetTotalCountAsync(QueryParams query)
    {
        var filter = BuildFilter(query);
        return await FotovoltanicDataCollection.CountDocumentsAsync(filter);
    }

    public async Task<IEnumerable<QueryDataDto>> GetDataAsync(QueryParams query)
    {
        var filter = BuildFilter(query);

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

        var uniqueDeviceName = e.ApplicationMessage.Topic.Split('/')[2] + "_" + e.ApplicationMessage.Topic.Split('/')[1];
        var account = _blockchainService.StringToAccount(uniqueDeviceName);

        _blockchainService.TransferToAdress(account.Address, 1);

        //var transferTask = _blockchainService.TransferToAdress(account.Address, 1);
        //var insertToCollectionTask = FotovoltanicDataCollection.InsertOneAsync(data);
        //Task[] tasks = [transferTask, insertToCollectionTask];
        //await Task.WhenAll(tasks);
        await FotovoltanicDataCollection.InsertOneAsync(data);
    }
}