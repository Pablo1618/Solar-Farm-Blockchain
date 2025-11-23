export type SensorType =
    | 'promieniowanie_sloneczne'
    | 'temperatura_panelu'
    | 'temperatura_powietrza'
    | 'generowana_moc';

export const SENSOR_TYPES = {
    SOLAR_RADIATION: 'promieniowanie_sloneczne' as SensorType,
    PANEL_TEMPERATURE: 'temperatura_panelu' as SensorType,
    AIR_TEMPERATURE: 'temperatura_powietrza' as SensorType,
    POWER_GENERATION: 'generowana_moc' as SensorType,
};

export interface SensorReading {
    value: number;
    timestamp: number;
}

export interface SensorData {
    id: string;
    type: SensorType;
    instance: number;
    deviceName: string;
    readings: SensorReading[];
    currentValue: number;
    averageValue: number;
}

export interface SensorState {
    sensors: SensorData[];
}
