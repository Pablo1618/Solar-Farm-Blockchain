import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { SensorData } from '../types/sensor.types';
import { SENSOR_TYPES } from '../types/sensor.types';
import { initializeAllSensors, addSensorReading } from '../utils/sensorUtils';
import { SensorContext } from './SensorContextDefinition';

export { SensorContext };

export function SensorProvider({ children }: { children: ReactNode }) {
    const [sensors, setSensors] = useState<SensorData[]>([]);

    useEffect(() => {
        const initialSensors = initializeAllSensors();
        setSensors(initialSensors);
    }, []);

    useEffect(() => {
        if (sensors.length === 0) return;

        const interval = setInterval(() => {
            setSensors((prevSensors) => {
                const solarRadiationSensors = prevSensors.filter(
                    (s) => s.type === SENSOR_TYPES.SOLAR_RADIATION
                );

                return prevSensors.map((sensor) => {
                    if (sensor.type === SENSOR_TYPES.SOLAR_RADIATION) {
                        return addSensorReading(sensor);
                    }

                    const correspondingSolarSensor = solarRadiationSensors.find(
                        (s) => s.instance === sensor.instance
                    );
                    const solarRadiation = correspondingSolarSensor
                        ? correspondingSolarSensor.currentValue
                        : 800;

                    return addSensorReading(sensor, solarRadiation);
                });
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [sensors.length]);

    return (
        <SensorContext.Provider value={{ sensors }}>
            {children}
        </SensorContext.Provider>
    );
}
