#!/bin/bash

MQTT_HOST="localhost"
MQTT_PORT=1883

DEVICES=("device1" "device2" "device3" "device4")
DATA_TYPES=("Irradiance" "PanelTemp" "AirTemp" "Power")

# Function to generate random float
rand_float() {
    min=$1
    max=$2
    awk -v min="$min" -v max="$max" 'BEGIN{srand(); print min+rand()*(max-min)}'
}

# Number of messages per device/type
MESSAGES=4

for ((i=1;i<=MESSAGES;i++)); do
    for device in "${DEVICES[@]}"; do
        for type in "${DATA_TYPES[@]}"; do
            case "$type" in
                "Irradiance") value=$(rand_float 0 1) ;;
                "PanelTemp") value=$(rand_float 15 45) ;;
                "AirTemp") value=$(rand_float 10 50) ;;
                "Power") value=$(rand_float 0 5000) ;;
            esac

            mosquitto_pub -h "$MQTT_HOST" -p "$MQTT_PORT" -t "fotovolt/$device/$type" -m "$value"
            echo "Published $value to $device/$type"
        done
    done
    sleep 1 
done
