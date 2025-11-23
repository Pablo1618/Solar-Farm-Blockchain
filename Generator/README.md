#### Real-time data generation

CLI tool handles data generation and publishing. Before running, set environmental variables:
- `MQTT_CLIENT_ID`: MQTT client identifier (default: "DataGenerator")
- `MQTT_HOST`: MQTT broker hostname (default: "localhost")
- `MQTT_PORT`: MQTT broker port (default: "1883")

##### Commands

###### `start`

Starts a new worker that generates and publishes data at regular intervals.

**Usage:**
```
start <device-name> <device-type> <interval> <min-value> <max-value> [start-timestamp]
```

**Parameters:**
- `device-name`: name of the device
- `device-type`: type of the device (`Irradiance`, `Power`, `PanelTemp`, `AirTemp`)
- `interval`: time between data points in seconds
- `min-value`: minimum floating point value possible
- `max-value`: maximum floating point value possible
- `start-timestamp`: optional starting timestamp in ISO 8601 format

**Examples**
```
start solar1 PanelTemp 10 -30 70
start solar2 Power 30 10 20 2025-11-20T08:00:00+01:00
```

###### `stop`

Stops a running worker.

**Usage:**
```
stop <device-name> <device-type>
```

**Parameters:**
- `device-name`: name of the device
- `device-type`: type of the device (`Irradiance`, `Power`, `PanelTemp`, `AirTemp`)

###### `insert`

Publishes a single data value immediately.

**Usage:**
```
insert <device-name> <device-type> <value> [timestamp]
```

**Parameters:**
- `device-name`: name of the device
- `device-type`: type of the device (`Irradiance`, `Power`, `PanelTemp`, `AirTemp`)
- `value`: floating point data value to insert
- `timestamp`: optional timestamp in ISO 8601 format (default: current time)

###### `list`

Displays all currently running workers.

**Usage:**
```
list
```

###### `quit` / `exit`

Stops all running workers, disconnects from the MQTT broker, and exits the application.

**Usage:**
```
quit
```

##### Example workflow

```
start dev01 Power 5 0 30
start dev01 PanelTemp 5 -10 70
start dev01 AirTemp 5 -10 30
insert dev01 Irradiance 30
exit
