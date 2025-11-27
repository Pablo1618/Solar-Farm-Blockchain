import React, { useState, useEffect, useCallback } from 'react';
import type { SensorType } from '../types/sensor.types';
import { SENSOR_TYPES } from '../types/sensor.types';
import DataFilters from '../components/DataFilters';
import SensorChart from '../components/SensorChart';
import './Charts.css';

interface ChartDataPoint {
    timestamp: number;
    value: number;
    sensorId: string;
    deviceName: string;
    sensorType: SensorType;
}

function Charts() {
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
    const [sensorInstance, setSensorInstance] = useState<string | 'all'>('all');
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(false);

    const handleReset = () => {
        const newNow = new Date();
        const newOneHourAgo = new Date(newNow.getTime() - 60 * 60 * 1000);
        setDateFrom(formatDateForInput(newOneHourAgo));
        setDateTo(formatDateForInput(newNow));
        setSensorType('all');
        setSensorInstance('all');
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);

            params.append('from', fromDate.toISOString());
            params.append('to', toDate.toISOString());
            params.append('sortBy', 'Timestamp');
            params.append('desc', 'false');
            params.append('limit', '1000');

            if (sensorInstance !== 'all') {
                params.append('deviceName', sensorInstance);
            }

            if (sensorType !== 'all') {
                let backendType = '';
                switch (sensorType) {
                    case SENSOR_TYPES.SOLAR_RADIATION: backendType = 'Irradiance'; break;
                    case SENSOR_TYPES.PANEL_TEMPERATURE: backendType = 'PanelTemp'; break;
                    case SENSOR_TYPES.AIR_TEMPERATURE: backendType = 'AirTemp'; break;
                    case SENSOR_TYPES.POWER_GENERATION: backendType = 'Power'; break;
                }
                if (backendType) {
                    params.append('dataType', backendType);
                }
            }

            const response = await fetch(`/query?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const result = await response.json();

            const mappedData: ChartDataPoint[] = result.map((item: any) => {
                let type: SensorType = SENSOR_TYPES.SOLAR_RADIATION;
                switch (item.dataType) {
                    case 'IrradianceSensor': case 'Irradiance': type = SENSOR_TYPES.SOLAR_RADIATION; break;
                    case 'PanelTempSensor': case 'PanelTemp': type = SENSOR_TYPES.PANEL_TEMPERATURE; break;
                    case 'AirTempSensor': case 'AirTemp': type = SENSOR_TYPES.AIR_TEMPERATURE; break;
                    case 'PowerMeter': case 'Power': type = SENSOR_TYPES.POWER_GENERATION; break;
                }

                return {
                    timestamp: new Date(item.timestamp).getTime(),
                    value: item.data || item.latest,
                    sensorId: `${type}_${item.deviceName}`,
                    deviceName: item.deviceName,
                    sensorType: type,
                };
            });

            mappedData.sort((a, b) => a.timestamp - b.timestamp);

            setChartData(mappedData);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setChartData([]);
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo, sensorType, sensorInstance]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [fetchData]);

    return (
        <div className="charts-page-container">
            <div className="charts-header">
                <h1>Wykresy danych</h1>
                <p className="charts-subtitle">
                    Wizualizacja danych z czujników w formie wykresów liniowych
                </p>
            </div>

            <DataFilters
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

            {loading ? (
                <div className="loading-indicator">Ładowanie danych...</div>
            ) : (
                <SensorChart data={chartData} sensorType={sensorType} />
            )}
        </div>
    );
}

export default Charts;
