import { useState, useMemo } from 'react';
import { useSensors } from '../context/useSensors';
import type { SensorType } from '../types/sensor.types';
import ChartFilters from '../components/ChartFilters';
import SensorChart from '../components/SensorChart';
import './Charts.css';

interface ChartDataPoint {
    timestamp: number;
    value: number;
    sensorId: string;
    instance: number;
}

function Charts() {
    const { sensors } = useSensors();

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [dateFrom, setDateFrom] = useState(formatDateForInput(oneHourAgo));
    const [dateTo, setDateTo] = useState(formatDateForInput(now));
    const [sensorType, setSensorType] = useState<SensorType | 'all'>('all');
    const [sensorInstance, setSensorInstance] = useState<number | 'all'>('all');

    const handleReset = () => {
        const newNow = new Date();
        const newOneHourAgo = new Date(newNow.getTime() - 60 * 60 * 1000);
        setDateFrom(formatDateForInput(newOneHourAgo));
        setDateTo(formatDateForInput(newNow));
        setSensorType('all');
        setSensorInstance('all');
    };

    const chartData = useMemo(() => {
        const dateFromTimestamp = new Date(dateFrom).getTime();
        const dateToTimestamp = new Date(dateTo).getTime();

        const allPoints: ChartDataPoint[] = [];

        sensors.forEach((sensor) => {
            sensor.readings.forEach((reading) => {
                if (reading.timestamp < dateFromTimestamp || reading.timestamp > dateToTimestamp) {
                    return;
                }

                if (sensorType !== 'all' && sensor.type !== sensorType) {
                    return;
                }

                if (sensorInstance !== 'all' && sensor.instance !== sensorInstance) {
                    return;
                }

                allPoints.push({
                    timestamp: reading.timestamp,
                    value: reading.value,
                    sensorId: sensor.id,
                    instance: sensor.instance,
                });
            });
        });

        return allPoints;
    }, [sensors, dateFrom, dateTo, sensorType, sensorInstance]);

    return (
        <div className="charts-page-container">
            <div className="charts-header">
                <h1>Wykresy danych</h1>
                <p className="charts-subtitle">
                    Wizualizacja danych z czujników w formie wykresów liniowych
                </p>
            </div>

            <ChartFilters
                dateFrom={dateFrom}
                dateTo={dateTo}
                sensorType={sensorType}
                sensorInstance={sensorInstance}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onSensorTypeChange={setSensorType}
                onSensorInstanceChange={setSensorInstance}
                onReset={handleReset}
            />

            <SensorChart data={chartData} sensorType={sensorType} />
        </div>
    );
}

export default Charts;
