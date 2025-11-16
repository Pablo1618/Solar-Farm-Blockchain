import { useState, useMemo } from 'react';
import { useSensors } from '../context/useSensors';
import type { SensorType } from '../types/sensor.types';
import { getSensorDisplayName, getSensorUnit } from '../utils/sensorUtils';
import DataFilters from '../components/DataFilters';
import DataTable from '../components/DataTable';
import './Data.css';

interface DataTableRow {
  id: string;
  type: SensorType;
  instance: number;
  value: number;
  timestamp: number;
}

function Data() {
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

  const filteredData = useMemo(() => {
    const dateFromTimestamp = new Date(dateFrom).getTime();
    const dateToTimestamp = new Date(dateTo).getTime();

    const allReadings: DataTableRow[] = [];

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

        allReadings.push({
          id: sensor.id,
          type: sensor.type,
          instance: sensor.instance,
          value: reading.value,
          timestamp: reading.timestamp,
        });
      });
    });

    return allReadings.sort((a, b) => b.timestamp - a.timestamp);
  }, [sensors, dateFrom, dateTo, sensorType, sensorInstance]);

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert('Brak danych do eksportu');
      return;
    }

    const headers = ['Data i czas', 'Typ czujnika', 'Instancja', 'Wartość', 'Jednostka'];
    const csvRows = [headers.join(',')];

    filteredData.forEach((row) => {
      const date = new Date(row.timestamp).toLocaleString('pl-PL');
      const type = getSensorDisplayName(row.type);
      const instance = row.instance;
      const value = row.value.toFixed(2);
      const unit = getSensorUnit(row.type);

      csvRows.push(`"${date}","${type}",${instance},${value},"${unit}"`);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `dane_sensorow_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (filteredData.length === 0) {
      alert('Brak danych do eksportu');
      return;
    }

    const jsonData = filteredData.map((row) => ({
      dataICzas: new Date(row.timestamp).toLocaleString('pl-PL'),
      timestamp: row.timestamp,
      typCzujnika: getSensorDisplayName(row.type),
      typCzujnikaKod: row.type,
      instancja: row.instance,
      wartosc: row.value,
      jednostka: getSensorUnit(row.type),
    }));

    const jsonContent = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `dane_sensorow_${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="data-page-container">
      <div className="data-header">
        <h1>Przeglądanie danych</h1>
        <p className="data-subtitle">
          Tabelaryczny podgląd wszystkich zgromadzonych danych z czujników
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

      {filteredData.length > 0 && (
        <div className="export-buttons">
          <button onClick={exportToCSV} className="export-button csv-button">
            📥 Eksportuj do CSV
          </button>
          <button onClick={exportToJSON} className="export-button json-button">
            📥 Eksportuj do JSON
          </button>
        </div>
      )}

      <DataTable data={filteredData} />
    </div>
  );
}

export default Data;