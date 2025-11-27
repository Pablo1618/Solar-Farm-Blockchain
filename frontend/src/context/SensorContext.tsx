import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { SensorData } from '../types/sensor.types';
import { mapBackendDataToSensorData } from '../utils/sensorUtils';
import type { BackendDashboardData } from '../utils/sensorUtils';
import { SensorContext } from './SensorContextDefinition';

export { SensorContext };

export function SensorProvider({ children }: { children: ReactNode }) {
    const [sensors, setSensors] = useState<SensorData[]>([]);

    const fetchSensors = async () => {
        try {
            const response = await fetch('/dashboard');
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            const data: BackendDashboardData[] = await response.json();

            const mappedSensors = data
                .map(mapBackendDataToSensorData)
                .filter((s): s is SensorData => s !== null);

            mappedSensors.sort((a, b) => {
                if (a.type !== b.type) return a.type.localeCompare(b.type);
                return a.instance - b.instance;
            });

            setSensors(mappedSensors);
        } catch (error) {
            console.error('Error fetching sensor data:', error);
        }
    };

    useEffect(() => {
        fetchSensors();
        const interval = setInterval(fetchSensors, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <SensorContext.Provider value={{ sensors }}>
            {children}
        </SensorContext.Provider>
    );
}
