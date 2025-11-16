import type { SensorData } from '../types/sensor.types';
import { getSensorDisplayName, getSensorUnit } from '../utils/sensorUtils';
import './SensorCard.css';

interface SensorCardProps {
    sensor: SensorData;
}

function SensorCard({ sensor }: SensorCardProps) {
    const displayName = getSensorDisplayName(sensor.type);
    const unit = getSensorUnit(sensor.type);

    return (
        <div className="sensor-card">
            <div className="sensor-header">
                <h3 className="sensor-title">{displayName}</h3>
                <span className="sensor-instance">#{sensor.instance}</span>
            </div>
            <div className="sensor-body">
                <div className="sensor-value-container">
                    <div className="sensor-label">Ostatnia wartość</div>
                    <div className="sensor-current-value">
                        {sensor.currentValue.toFixed(2)}
                        <span className="sensor-unit">{unit}</span>
                    </div>
                </div>
                <div className="sensor-value-container">
                    <div className="sensor-label">Średnia (100 odczytów)</div>
                    <div className="sensor-average-value">
                        {sensor.averageValue.toFixed(2)}
                        <span className="sensor-unit">{unit}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SensorCard;
