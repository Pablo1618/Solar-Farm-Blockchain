import React from 'react';
import type { SensorType } from '../types/sensor.types';
import './DataFilters.css';

interface DataFiltersProps {
  dateFrom: string;
  dateTo: string;
  sensorType: SensorType | 'all';
  sensorInstance: string | 'all';
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSensorTypeChange: (value: SensorType | 'all') => void;
  onSensorInstanceChange: (value: string | 'all') => void;
  onReset: () => void;
}

function DataFilters({
  dateFrom,
  dateTo,
  sensorType,
  sensorInstance,
  onDateFromChange,
  onDateToChange,
  onSensorTypeChange,
  onSensorInstanceChange,
  onReset,
}: DataFiltersProps) {
  return (
    <div className="data-filters">
      <h3 className="filters-title">Filtry danych</h3>

      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="dateFrom">Data/czas od:</label>
          <input
            type="datetime-local"
            id="dateFrom"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="dateTo">Data/czas do:</label>
          <input
            type="datetime-local"
            id="dateTo"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="sensorType">Typ czujnika:</label>
          <select
            id="sensorType"
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
          <label htmlFor="sensorInstance">Instancja czujnika:</label>
          <select
            id="sensorInstance"
            value={sensorInstance}
            onChange={(e) => onSensorInstanceChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Wszystkie instancje</option>
            <option value="dev01">dev01</option>
            <option value="dev02">dev02</option>
            <option value="dev03">dev03</option>
            <option value="dev04">dev04</option>
          </select>
        </div>
      </div>

      <button onClick={onReset} className="reset-button">
        Wyczyść filtry
      </button>
    </div>
  );
}

export default DataFilters;
