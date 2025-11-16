import { useContext } from 'react';
import { SensorContext } from './SensorContextDefinition';

export function useSensors() {
  const context = useContext(SensorContext);
  if (context === undefined) {
    throw new Error('useSensors must be used within a SensorProvider');
  }
  return context;
}