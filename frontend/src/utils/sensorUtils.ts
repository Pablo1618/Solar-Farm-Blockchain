import type { SensorType, SensorData } from '../types/sensor.types';
import { SENSOR_TYPES } from '../types/sensor.types';

export function getSensorDisplayName(type: SensorType): string {
    const names: Record<string, string> = {
        [SENSOR_TYPES.SOLAR_RADIATION]: 'Promieniowanie słoneczne',
        [SENSOR_TYPES.PANEL_TEMPERATURE]: 'Temperatura panelu',
        [SENSOR_TYPES.AIR_TEMPERATURE]: 'Temperatura powietrza',
        [SENSOR_TYPES.POWER_GENERATION]: 'Generowana moc',
    };
    return names[type] || type;
}

export function getSensorUnit(type: SensorType): string {
    const units: Record<string, string> = {
        [SENSOR_TYPES.SOLAR_RADIATION]: 'W/m²',
        [SENSOR_TYPES.PANEL_TEMPERATURE]: '°C',
        [SENSOR_TYPES.AIR_TEMPERATURE]: '°C',
        [SENSOR_TYPES.POWER_GENERATION]: 'W',
    };
    return units[type] || '';
}

export interface BackendDashboardData {
    deviceName: string;
    dataType: string;
    timestamp: string;
    latest: number;
    average: number;
}

export function mapBackendDataToSensorData(data: BackendDashboardData): SensorData | null {
    let type: SensorType;

    switch (data.dataType) {
        case 'IrradianceSensor':
        case 'Irradiance':
            type = SENSOR_TYPES.SOLAR_RADIATION;
            break;
        case 'PanelTempSensor':
        case 'PanelTemp':
            type = SENSOR_TYPES.PANEL_TEMPERATURE;
            break;
        case 'AirTempSensor':
        case 'AirTemp':
            type = SENSOR_TYPES.AIR_TEMPERATURE;
            break;
        case 'PowerMeter':
        case 'Power':
            type = SENSOR_TYPES.POWER_GENERATION;
            break;
        default:
            console.warn(`Unknown sensor type: ${data.dataType}`);
            return null;
    }

    const instanceMatch = data.deviceName.match(/(?:device|dev)(\d+)/i);
    const instance = instanceMatch ? parseInt(instanceMatch[1], 10) : 0;

    return {
        id: `${type}_${data.deviceName}`,
        type,
        instance,
        deviceName: data.deviceName,
        readings: [],
        currentValue: data.latest,
        averageValue: data.average,
    };
}
