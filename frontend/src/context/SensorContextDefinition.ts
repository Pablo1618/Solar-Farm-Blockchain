import { createContext } from 'react';
import type { SensorData } from '../types/sensor.types';

export interface SensorContextType {
  sensors: SensorData[];
  availableDeviceNames: string[];
}

export const SensorContext = createContext<SensorContextType | undefined>(undefined);
