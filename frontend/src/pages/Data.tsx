import React, { useState, useEffect, useCallback } from 'react';
import type { SensorType } from '../types/sensor.types';
import { SENSOR_TYPES } from '../types/sensor.types';
import { getSensorDisplayName, getSensorUnit } from '../utils/sensorUtils';
import { useSensors } from '../context/useSensors';
import DataFilters from '../components/DataFilters';
import DataTable from '../components/DataTable';
import './Data.css';

interface DataTableRow {
  id: string;
  type: SensorType;
  deviceName: string;
  value: number;
  timestamp: number;
}

function Data() {
  const { availableDeviceNames } = useSensors();
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
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DataTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const pageSize = 100;

  const handleReset = () => {
    const newNow = new Date();
    const newOneHourAgo = new Date(newNow.getTime() - 60 * 60 * 1000);
    setDateFrom(formatDateForInput(newOneHourAgo));
    setDateTo(formatDateForInput(newNow));
    setSensorType('all');
    setSensorInstance('all');
    setSortDesc(true);
    setPage(1);
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
      params.append('desc', sortDesc.toString());
      params.append('limit', pageSize.toString());
      params.append('skip', ((page - 1) * pageSize).toString());

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

      const mappedData: DataTableRow[] = result.map((item: any) => {
        let type: SensorType = SENSOR_TYPES.SOLAR_RADIATION;
        switch (item.dataType) {
          case 'IrradianceSensor': case 'Irradiance': type = SENSOR_TYPES.SOLAR_RADIATION; break;
          case 'PanelTempSensor': case 'PanelTemp': type = SENSOR_TYPES.PANEL_TEMPERATURE; break;
          case 'AirTempSensor': case 'AirTemp': type = SENSOR_TYPES.AIR_TEMPERATURE; break;
          case 'PowerMeter': case 'Power': type = SENSOR_TYPES.POWER_GENERATION; break;
        }

        return {
          id: `${type}_${item.deviceName}_${item.timestamp}`,
          type,
          deviceName: item.deviceName,
          value: item.data || item.latest,
          timestamp: new Date(item.timestamp).getTime(),
        };
      });

      setData(mappedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, sensorType, sensorInstance, sortDesc, page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchData]);

  const exportToCSV = () => {
    if (data.length === 0) {
      alert('Brak danych do eksportu');
      return;
    }

    const headers = ['Data i czas', 'Typ czujnika', 'Urządzenie', 'Wartość', 'Jednostka'];
    const csvRows = [headers.join(',')];

    data.forEach((row) => {
      const date = new Date(row.timestamp).toLocaleString('pl-PL');
      const type = getSensorDisplayName(row.type);
      const value = row.value.toFixed(2);
      const unit = getSensorUnit(row.type);

      csvRows.push(`"${date}","${type}","${row.deviceName}",${value},"${unit}"`);
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
    if (data.length === 0) {
      alert('Brak danych do eksportu');
      return;
    }

    const jsonData = data.map((row) => ({
      dataICzas: new Date(row.timestamp).toLocaleString('pl-PL'),
      timestamp: row.timestamp,
      typCzujnika: getSensorDisplayName(row.type),
      typCzujnikaKod: row.type,
      urzadzenie: row.deviceName,
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
        availableInstances={availableDeviceNames}
        onDateFromChange={(d) => { setDateFrom(d); setPage(1); }}
        onDateToChange={(d) => { setDateTo(d); setPage(1); }}
        onSensorTypeChange={(t) => { setSensorType(t); setPage(1); }}
        onSensorInstanceChange={(i) => { setSensorInstance(i); setPage(1); }}
        onReset={handleReset}
      />

      {data.length > 0 && (
        <div className="export-buttons">
          <button onClick={exportToCSV} className="export-button csv-button">
            📥 Eksportuj do CSV
          </button>
          <button onClick={exportToJSON} className="export-button json-button">
            📥 Eksportuj do JSON
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-indicator">Ładowanie danych...</div>
      ) : (
        <DataTable
          data={data}
          sortDesc={sortDesc}
          onSortToggle={() => setSortDesc(!sortDesc)}
        />
      )}

      <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="filter-button"
        >
          &lt; Poprzednia
        </button>
        <span>Strona {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={data.length < pageSize || loading}
          className="filter-button"
        >
          Następna &gt;
        </button>
      </div>
    </div>
  );
}

export default Data;