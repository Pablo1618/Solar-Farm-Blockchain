

using Microsoft.VisualBasic;
using MongoDB.Driver;
using MQTTnet;

class BackendService
{
    readonly string _mongoDbName = Environment.GetEnvironmentVariable("MONGO_DATABASE") ?? "main";


    private IMqttClient _mqttClient;
    private IMongoClient _mongoClient;

    public IMongoCollection<Test> TestCollection { get; set; }


    public BackendService(IMqttClient mqttClient, IMongoClient mongoClient)
    {
        _mqttClient = mqttClient;
        _mongoClient = mongoClient;

        TestCollection = _mongoClient.GetDatabase(_mongoDbName).GetCollection<Test>("Test");
    }
}