import React from 'react';
import type { SensorType } from '../types/sensor.types';
import './ChartFilters.css';

interface ChartFiltersProps {
    dateFrom: string;
    dateTo: string;
    sensorType: SensorType | 'all';
    sensorInstance: string | 'all';
    availableInstances: string[];
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onSensorTypeChange: (value: SensorType | 'all') => void;
    onSensorInstanceChange: (value: string | 'all') => void;
    onReset: () => void;
}

function ChartFilters({
    dateFrom,
    dateTo,
    sensorType,
    sensorInstance,
    availableInstances,
    onDateFromChange,
    onDateToChange,
    onSensorTypeChange,
    onSensorInstanceChange,
    onReset,
}: ChartFiltersProps) {
    return (
        <div className="chart-filters">
            <h3 className="filters-title">Filtry wykresów</h3>

            <div className="filters-grid">
                <div className="filter-group">
                    <label htmlFor="chartDateFrom">Data/czas od:</label>
                    <input
                        type="datetime-local"
                        id="chartDateFrom"
                        value={dateFrom}
                        onChange={(e) => onDateFromChange(e.target.value)}
                        className="filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="chartDateTo">Data/czas do:</label>
                    <input
                        type="datetime-local"
                        id="chartDateTo"
                        value={dateTo}
                        onChange={(e) => onDateToChange(e.target.value)}
                        className="filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="chartSensorType">Typ czujnika:</label>
                    <select
                        id="chartSensorType"
                        value={sensorType}
                        onChange={(e) => onSensorTypeChange(e.target.value as SensorType | 'all')}
                        className="filter-select"
                    >
                        <option value="all">Wszystkie typy</option>
                        <option value="promieniowanie_sloneczne">Promieniowanie słoneczne</option>
                        <option value="temperatura_panelu">Temperatura panelu</option>
                        <option value="temperatura_powietrza">Temperatura powietrza</option>
                        <option value="generowana_moc">Generowana moc</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="chartSensorInstance">Instancja czujnika:</label>
                    <select
                        id="chartSensorInstance"
                        value={sensorInstance}
                        onChange={(e) => onSensorInstanceChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Wszystkie instancje</option>
                        {availableInstances.map((instance) => (
                            <option key={instance} value={instance}>
                                {instance}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button onClick={onReset} className="reset-button">
                Wyczyść filtry
            </button>
        </div>
    );
}

export default ChartFilters;
