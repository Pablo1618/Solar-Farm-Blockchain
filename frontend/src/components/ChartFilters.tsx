import type { SensorType } from '../types/sensor.types';
import './ChartFilters.css';

interface ChartFiltersProps {
    dateFrom: string;
    dateTo: string;
    sensorType: SensorType | 'all';
    sensorInstance: number | 'all';
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onSensorTypeChange: (value: SensorType | 'all') => void;
    onSensorInstanceChange: (value: number | 'all') => void;
    onReset: () => void;
}

function ChartFilters({
    dateFrom,
    dateTo,
    sensorType,
    sensorInstance,
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
                        onChange={(e) => onSensorInstanceChange(
                            e.target.value === 'all' ? 'all' : Number(e.target.value)
                        )}
                        className="filter-select"
                    >
                        <option value="all">Wszystkie instancje</option>
                        <option value="1">Instancja #1</option>
                        <option value="2">Instancja #2</option>
                        <option value="3">Instancja #3</option>
                        <option value="4">Instancja #4</option>
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
