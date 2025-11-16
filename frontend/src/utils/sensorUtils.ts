import type { SensorType, SensorReading, SensorData } from '../types/sensor.types';
import { SENSOR_TYPES } from '../types/sensor.types';

// Generowanie losowej wartości w zakresie z pewnymi fluktuacjami
function randomInRange(min: number, max: number, variance: number = 0.1): number {
    const base = min + Math.random() * (max - min);
    const fluctuation = base * variance * (Math.random() - 0.5) * 2;
    return Math.max(min, Math.min(max, base + fluctuation));
}

// Generowanie sensownych wartości bazując na promieniowaniu słonecznym
export function generateSensorValue(
    type: SensorType,
    solarRadiation: number = 0
): number {
    switch (type) {
        case SENSOR_TYPES.SOLAR_RADIATION: {
            // Promieniowanie słoneczne: 0-1200 W/m²
            return Number(randomInRange(200, 1200, 0.15).toFixed(2));
        }

        case SENSOR_TYPES.PANEL_TEMPERATURE: {
            // Temperatura panelu: zależy od promieniowania
            // Im więcej promieniowania, tym wyższa temperatura
            const baseTemp = 15 + (solarRadiation / 1200) * 45; // 15-60°C
            return Number(randomInRange(baseTemp - 5, baseTemp + 5, 0.1).toFixed(2));
        }

        case SENSOR_TYPES.AIR_TEMPERATURE: {
            // Temperatura powietrza: 10-35°C (mniej zależna od promieniowania)
            const airBase = 20 + (solarRadiation / 1200) * 15;
            return Number(randomInRange(airBase - 5, airBase + 5, 0.1).toFixed(2));
        }

        case SENSOR_TYPES.POWER_GENERATION: {
            // Generowana moc: silnie zależy od promieniowania
            // Przyjmujemy panel ~300W szczytowej mocy
            const efficiency = 0.15 + Math.random() * 0.05; // 15-20% wydajności
            const maxPower = 300; // W
            const power = (solarRadiation / 1000) * maxPower * efficiency;
            return Number(randomInRange(power * 0.8, power * 1.2, 0.1).toFixed(2));
        }

        default:
            return 0;
    }
}

// Inicjalizacja sensora z 100 historycznymi odczytami
export function initializeSensor(
    type: SensorType,
    instance: number
): SensorData {
    const readings: SensorReading[] = [];
    const now = Date.now();

    // Generujemy 100 historycznych odczytów (co ~10 sekund wstecz)
    let solarRadiation = 0;

    for (let i = 99; i >= 0; i--) {
        // Najpierw generujemy promieniowanie dla tego momentu
        if (type === SENSOR_TYPES.SOLAR_RADIATION) {
            solarRadiation = generateSensorValue(type);
        } else {
            // Dla innych sensorów używamy losowego promieniowania z zakresu
            solarRadiation = randomInRange(200, 1200);
        }

        const value = type === SENSOR_TYPES.SOLAR_RADIATION
            ? solarRadiation
            : generateSensorValue(type, solarRadiation);

        readings.push({
            value,
            timestamp: now - (i * 10000), // co 10 sekund wstecz
        });
    }

    const currentValue = readings[readings.length - 1].value;
    const averageValue = Number(
        (readings.reduce((sum, r) => sum + r.value, 0) / readings.length).toFixed(2)
    );

    return {
        id: `${type}_${instance}`,
        type,
        instance,
        readings,
        currentValue,
        averageValue,
    };
}

// Inicjalizacja wszystkich 16 sensorów (4 typy × 4 instancje)
export function initializeAllSensors(): SensorData[] {
    const sensors: SensorData[] = [];
    const types = Object.values(SENSOR_TYPES);

    types.forEach((type) => {
        for (let instance = 1; instance <= 4; instance++) {
            sensors.push(initializeSensor(type, instance));
        }
    });

    return sensors;
}

// Dodanie nowego odczytu do sensora
export function addSensorReading(
    sensor: SensorData,
    solarRadiation: number = 0
): SensorData {
    const newValue = sensor.type === SENSOR_TYPES.SOLAR_RADIATION
        ? generateSensorValue(sensor.type)
        : generateSensorValue(sensor.type, solarRadiation);

    const newReading: SensorReading = {
        value: newValue,
        timestamp: Date.now(),
    };

    // Zachowujemy tylko ostatnie 100 odczytów
    const updatedReadings = [...sensor.readings, newReading].slice(-100);

    const averageValue = Number(
        (updatedReadings.reduce((sum, r) => sum + r.value, 0) / updatedReadings.length).toFixed(2)
    );

    return {
        ...sensor,
        readings: updatedReadings,
        currentValue: newValue,
        averageValue,
    };
}

// Pobieranie nazwy sensora do wyświetlenia
export function getSensorDisplayName(type: SensorType): string {
    const names: Record<string, string> = {
        [SENSOR_TYPES.SOLAR_RADIATION]: 'Promieniowanie słoneczne',
        [SENSOR_TYPES.PANEL_TEMPERATURE]: 'Temperatura panelu',
        [SENSOR_TYPES.AIR_TEMPERATURE]: 'Temperatura powietrza',
        [SENSOR_TYPES.POWER_GENERATION]: 'Generowana moc',
    };
    return names[type] || type;
}

// Pobieranie jednostki sensora
export function getSensorUnit(type: SensorType): string {
    const units: Record<string, string> = {
        [SENSOR_TYPES.SOLAR_RADIATION]: 'W/m²',
        [SENSOR_TYPES.PANEL_TEMPERATURE]: '°C',
        [SENSOR_TYPES.AIR_TEMPERATURE]: '°C',
        [SENSOR_TYPES.POWER_GENERATION]: 'W',
    };
    return units[type] || '';
}
