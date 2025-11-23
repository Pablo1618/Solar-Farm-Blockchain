using DataGeneration;
using MQTTnet;

class Program
{
    private static readonly Dictionary<string, CancellationTokenSource> Workers = [];
    static async Task<int> Main()
    {

        Console.WriteLine("CLI Data Generator for Fotovoltanic Devices");
        var mqttFactory = new MqttClientFactory();
        var mqttClient = mqttFactory.CreateMqttClient();
        var clientOptions = new MqttClientOptionsBuilder()
            .WithClientId(Environment.GetEnvironmentVariable("MQTT_CLIENT_ID") ?? "DataGenerator")
            .WithTcpServer(Environment.GetEnvironmentVariable("MQTT_HOST") ?? "localhost",
                int.Parse(Environment.GetEnvironmentVariable("MQTT_PORT") ?? "1883"))
            .WithCleanSession()
            .Build();
        await mqttClient.ConnectAsync(clientOptions);
        while (true)
        {
            Console.Write("> ");
            var input = (await Console.In.ReadLineAsync())?.Trim();
            if (string.IsNullOrWhiteSpace(input))
            {
                continue;
            }
            var parts = input.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var command = parts[0].ToLowerInvariant();
            var arguments = parts.Skip(1);
            switch (command)
            {
                case "exit":
                case "quit":
                    Console.WriteLine("Stopping all workers...");
                    foreach (var cancellationTokenSource in Workers.Values)
                    {
                        cancellationTokenSource.Cancel();
                    }
                    await mqttClient.DisconnectAsync();
                    return 0;
                case "start":
                    await HandleStart(arguments, mqttClient);
                    break;
                case "stop":
                    await HandleStop(arguments);
                    break;
                case "insert":
                    await HandleInsert(arguments, mqttClient);
                    break;
                case "list":
                    HandleList();
                    break;
                default:
                    Console.WriteLine($"Unknown command: {command}");
                    break;
            }
        }
    }
    private static async Task HandleStart(IEnumerable<string> arguments, IMqttClient mqttClient)
    {
        var argumentCount = arguments.Count();
        if (argumentCount < 5 || argumentCount > 6)
        {
            Console.WriteLine("Usage: start <device-name> <device-type> <interval> <min-value> <max-value> [start-timestamp]");
            return;
        }
        var deviceName = arguments.ElementAt(0);
        if (!Enum.TryParse<DeviceType>(arguments.ElementAt(1), ignoreCase: true, out var deviceType))
        {
            Console.WriteLine("Invalid device type");
            return;
        }
        if (!Double.TryParse(arguments.ElementAt(2), out var interval) || interval < 0)
        {
            Console.WriteLine("Interval must be a positive floating point value");
            return;
        }
        if (!Double.TryParse(arguments.ElementAt(3), out var minValue))
        {
            Console.WriteLine("Minimum value must be a floating point value");
            return;
        }
        if (!Double.TryParse(arguments.ElementAt(4), out var maxValue))
        {
            Console.WriteLine("Maximum value must be a floating point value");
            return;
        }
        if (minValue > maxValue)
        {
            Console.WriteLine("Minimum value cannot be higher than maximum value");
            return;
        }
        var startTimestamp = DateTimeOffset.Now;
        if (argumentCount == 6 && !DateTimeOffset.TryParse(arguments.ElementAtOrDefault(5), out startTimestamp))
        {
            Console.WriteLine("Invalid start timestamp");
            return;
        }
        var workerName = GetWorkerName(deviceName, deviceType);
        if (Workers.ContainsKey(workerName))
        {
            Console.WriteLine($"Worker <{workerName}> is already running");
            return;
        }
        var cancellationTokenSource = new CancellationTokenSource();
        Workers[workerName] = cancellationTokenSource;
        Console.WriteLine($"Starting worker <{workerName}>...");
        _ = RunWorkerAsync(deviceName, deviceType, TimeSpan.FromSeconds(interval), startTimestamp, minValue, maxValue, mqttClient,
            cancellationTokenSource.Token);
    }
    private static async Task HandleStop(IEnumerable<string> arguments)
    {
        if (arguments.Count() != 2)
        {
            Console.WriteLine("Usage: stop <device-name> <device-type>");
            return;
        }
        var deviceName = arguments.ElementAt(0);
        if (!Enum.TryParse<DeviceType>(arguments.ElementAt(1), ignoreCase: true, out var deviceType))
        {
            Console.WriteLine("Invalid device type");
            return;
        }
        var workerName = GetWorkerName(deviceName, deviceType);
        if (!Workers.TryGetValue(workerName, out var cancellationTokenSource))
        {
            Console.WriteLine($"Worker <{workerName}> is not running");
            return;
        }
        Console.WriteLine($"Stopping worker <{workerName}>...");
        cancellationTokenSource.Cancel();
        Workers.Remove($"{deviceName}_{deviceType}");
    }
    private static async Task HandleInsert(IEnumerable<string> arguments, IMqttClient mqttClient)
    {
        var argumentCount = arguments.Count();
        if (argumentCount < 3 || argumentCount > 4)
        {
            Console.WriteLine("Usage: insert <device-name> <device-type> <value> [timestamp]");
            return;
        }
        var deviceName = arguments.ElementAt(0);
        if (!Enum.TryParse<DeviceType>(arguments.ElementAt(1), ignoreCase: true, out var deviceType))
        {
            Console.WriteLine("Invalid device type");
            return;
        }
        if (!Double.TryParse(arguments.ElementAt(2), out var value))
        {
            Console.WriteLine("Value must be a floating point value");
            return;
        }
        var timestamp = DateTimeOffset.Now;
        if (argumentCount == 4 && !DateTimeOffset.TryParse(arguments.ElementAt(3), out timestamp))
        {
            Console.WriteLine("Invalid timestamp");
            return;
        }
        var cancellationTokenSource = new CancellationTokenSource();
        _ = Insert(deviceName, deviceType, timestamp, value, mqttClient, cancellationTokenSource.Token);
    }
    private static void HandleList()
    {
        if (Workers.Count == 0)
        {
            Console.WriteLine("No workers are running.");
            return;
        }
        Console.WriteLine("Running workers:");
        foreach (var workerName in Workers.Keys)
        {
            Console.WriteLine($"\t{workerName}");
        }
    }
    private static async Task RunWorkerAsync(string deviceName, DeviceType deviceType, TimeSpan interval,
        DateTimeOffset startTimestamp, double minValue, double maxValue, IMqttClient mqttClient, CancellationToken cancellationToken)
    {
        try
        {
            var device = DeviceFactory.Create(deviceName, deviceType);
            var generator = new FotovoltanicDataGenerator(device, startTimestamp, interval, minValue, maxValue);
            var timer = new PeriodicTimer(interval);
            var publisher = new MqttPublisher(mqttClient);
            while (await timer.WaitForNextTickAsync(cancellationToken))
            {
                var data = generator.Generate();
                await publisher.PublishAsync(data, cancellationToken);
            }
            
        }
        catch (OperationCanceledException) {}
        catch (Exception exception)
        {
            var workerName = GetWorkerName(deviceName, deviceType);
            Console.WriteLine($"Worker <{workerName}> crashed: {exception}");
        }
    }
    private static async Task Insert(string deviceName, DeviceType deviceType, DateTimeOffset timestamp, double value,
        IMqttClient mqttClient, CancellationToken cancellationToken)
    {
        try
        {
            var device = DeviceFactory.Create(deviceName, deviceType);
            var generator = new FotovoltanicDataGenerator(device, timestamp, TimeSpan.Zero, value, value);
            var publisher = new MqttPublisher(mqttClient);
            var data = generator.Generate();
            await publisher.PublishAsync(data, cancellationToken);
        }
        catch (OperationCanceledException) {}
        catch (Exception exception)
        {
            Console.WriteLine($"Insert failed: {exception}");
        }
    }
    private static string GetWorkerName(string deviceName, DeviceType deviceType)
    {
        return $"{deviceName}/{deviceType}";
    }
}
