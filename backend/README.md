To whomever it may concern:

## Files for docs:

### test_mqtt.sh
Shows how to send data to mqtt broker

### dashboard_example.json
Example output of /dashboard endpoint, might be empty, or some combinations might not exist before the data starts existing

### query_example.json
Example output of /query endpoint, might be empty if no data

### SolarFarmBackend.http
Has some endpoints tests, and query examples, kinda important to check I guess

### Program.cs
Has all 3 (2 useful) endpoints there

Query params btw, all start lowercase in the url:
```
string? DeviceName,
DeviceType? DataType,
DateTimeOffset? From,
DateTimeOffset? To,
string? SortBy,
int? Limit,
int? Skip,
bool Desc = false
```





