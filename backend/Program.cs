using MongoDB.Driver;
using MQTTnet;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Create MongoDB Client
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var mongoHost = Environment.GetEnvironmentVariable("MONGO_HOST") ?? "localhost";
    var mongoPort = Environment.GetEnvironmentVariable("MONGO_PORT") ?? "27017";
    var mongoUser = Environment.GetEnvironmentVariable("MONGO_USERNAME");
    var mongoPassword = Environment.GetEnvironmentVariable("MONGO_PASSWORD");
    var mongoDatabase = Environment.GetEnvironmentVariable("MONGO_DATABASE");

    if (string.IsNullOrEmpty(mongoUser) || string.IsNullOrEmpty(mongoPassword))
    {
        throw new InvalidOperationException("MongoDB credentials are not set in environment variables.");
    }

    var mongoClientSettings = MongoClientSettings.FromUrl(new MongoUrl($"mongodb://{mongoUser}:{mongoPassword}@{mongoHost}:{mongoPort}"));
    var mongoClient = new MongoClient(mongoClientSettings);
    mongoClient.DropDatabase(mongoDatabase);
    return mongoClient;
});

// Create MQTT Client
builder.Services.AddSingleton<IMqttClient>(sp =>
{
    var factory = new MqttClientFactory();
    var client = factory.CreateMqttClient();

    var mqttHost = Environment.GetEnvironmentVariable("MQTT_HOST") ?? "localhost";
    var mqttPort = int.Parse(Environment.GetEnvironmentVariable("MQTT_PORT") ?? "1883");
    var mqttClientId = Environment.GetEnvironmentVariable("MQTT_CLIENT_ID") ?? "MySimpleApi";

    var optionsBuilder = new MqttClientOptionsBuilder()
        .WithClientId(mqttClientId)
        .WithTcpServer(mqttHost, mqttPort)
        .WithCleanSession();

    var options = optionsBuilder.Build();

    client.ConnectAsync(options, CancellationToken.None).GetAwaiter().GetResult();
    Console.WriteLine($"Connected to MQTT broker at {mqttHost}:{mqttPort}");

    return client;
});

builder.Services.AddSingleton<BackendService>();

var app = builder.Build();

app.UseHttpsRedirection();

app.MapGet("/test", (BackendService backend) =>
{
    var testItem = new Test();
    backend.TestCollection.InsertOne(testItem);
    var allItems = backend.TestCollection.Find(_ => true).ToList();
    return allItems;
})
.WithName("Test")
.WithOpenApi();

app.Run();
