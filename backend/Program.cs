using MongoDB.Driver;
using MQTTnet;
using Backend;
using Backend.DataTypes;
using SolarFarmBackend.blockchain;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader()
               .WithExposedHeaders("X-Total-Count");
    });
});

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
    // mongoClient.DropDatabase(mongoDatabase);
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

builder.Services.AddSingleton<BlockchainService>();

var app = builder.Build();

var blockchain = app.Services.GetRequiredService<BlockchainService>();
// Initialize BackendService to force init mongo and mqtt
var backend = app.Services.GetRequiredService<BackendService>();

app.UseCors();
app.UseHttpsRedirection();

app.MapGet("/dashboard", (BackendService backend) =>
{
    return Results.Ok(backend.GetDashboardData());
})
.WithName("Dashboard")
.WithOpenApi();

app.MapGet("/query", async (BackendService backend, HttpContext http, [AsParameters] QueryParams queryParams) =>
{
    var totalCount = await backend.GetTotalCountAsync(queryParams);
    http.Response.Headers.Append("X-Total-Count", totalCount.ToString());

    var queryResult = await backend.GetDataAsync(queryParams);
    return Results.Ok(queryResult);
})
.WithName("Query")
.WithOpenApi();

app.MapGet("/csv", async (BackendService backend, [AsParameters] QueryParams queryParams) =>
{
    var queryResult = await backend.GetDataCsvAsync(queryParams);
    return Results.Text(queryResult, "text/csv", System.Text.Encoding.UTF8);
})
.WithName("Csv")
.WithOpenApi();

app.Run();
