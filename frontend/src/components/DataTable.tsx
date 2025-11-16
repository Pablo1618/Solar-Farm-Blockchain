import type { SensorType } from '../types/sensor.types';
import { getSensorDisplayName, getSensorUnit } from '../utils/sensorUtils';
import './DataTable.css';

interface DataTableRow {
  id: string;
  type: SensorType;
  instance: number;
  value: number;
  timestamp: number;
}

interface DataTableProps {
  data: DataTableRow[];
}

function DataTable({ data }: DataTableProps) {
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (data.length === 0) {
    return (
      <div className="data-table-container">
        <div className="no-data">
          <p>Brak danych spełniających kryteria filtrowania</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="table-info">
        <span className="record-count">Znaleziono rekordów: {data.length}</span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data i czas</th>
              <th>Typ czujnika</th>
              <th>Instancja</th>
              <th>Wartość</th>
              <th>Jednostka</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={`${row.id}-${row.timestamp}-${index}`}>
                <td className="timestamp-cell">{formatDateTime(row.timestamp)}</td>
                <td className="type-cell">{getSensorDisplayName(row.type)}</td>
                <td className="instance-cell">
                  <span className="instance-badge">#{row.instance}</span>
                </td>
                <td className="value-cell">{row.value.toFixed(2)}</td>
                <td className="unit-cell">{getSensorUnit(row.type)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
