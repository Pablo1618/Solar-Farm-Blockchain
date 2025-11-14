using MongoDB.Driver;
using MQTTnet;
using Backend;

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

    return client;
});

builder.Services.AddSingleton<BackendService>();

var app = builder.Build();

// Initialize BackendService to force init mongo and mqtt
var backend = app.Services.GetRequiredService<BackendService>();

app.UseHttpsRedirection();

app.MapGet("/dashboard", (BackendService backend) =>
{
    return backend.GetDashboardData();
})
.WithName("Dashboard")
.WithOpenApi();

app.MapGet("/data", (BackendService backend) =>
{
    
})
.WithName("Data")
.WithOpenApi();

app.Run();
