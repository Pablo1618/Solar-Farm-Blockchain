import { useSensors } from '../context/useSensors';
import SensorCard from '../components/SensorCard';
import { SENSOR_TYPES } from '../types/sensor.types';
import './Dashboard.css';

function Dashboard() {
    const { sensors } = useSensors();

    const sensorsByType = {
        [SENSOR_TYPES.SOLAR_RADIATION]: sensors.filter(s => s.type === SENSOR_TYPES.SOLAR_RADIATION),
        [SENSOR_TYPES.PANEL_TEMPERATURE]: sensors.filter(s => s.type === SENSOR_TYPES.PANEL_TEMPERATURE),
        [SENSOR_TYPES.AIR_TEMPERATURE]: sensors.filter(s => s.type === SENSOR_TYPES.AIR_TEMPERATURE),
        [SENSOR_TYPES.POWER_GENERATION]: sensors.filter(s => s.type === SENSOR_TYPES.POWER_GENERATION),
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Pulpit Monitorowania</h1>
                <p className="dashboard-subtitle">
                    System monitorowania farmy fotowoltaicznej - {sensors.length} aktywnych sensorów
                </p>
            </div>

            <div className="dashboard-content">
                {Object.entries(sensorsByType).map(([type, typeSensors]) => (
                    <div key={type} className="sensor-group">
                        <div className="sensor-grid">
                            {typeSensors.map((sensor) => (
                                <SensorCard key={sensor.id} sensor={sensor} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
