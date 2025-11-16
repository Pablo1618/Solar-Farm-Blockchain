import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import type { SensorType } from '../types/sensor.types';
import { getSensorDisplayName, getSensorUnit } from '../utils/sensorUtils';
import './SensorChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface ChartDataPoint {
    timestamp: number;
    value: number;
    sensorId: string;
    instance: number;
}

interface SensorChartProps {
    data: ChartDataPoint[];
    sensorType: SensorType | 'all';
}

function SensorChart({ data, sensorType }: SensorChartProps) {
    if (data.length === 0) {
        return (
            <div className="chart-container">
                <div className="no-chart-data">
                    <p>Brak danych do wyświetlenia wykresu</p>
                    <p className="hint">Wybierz zakres dat i filtry, aby zobaczyć wykres</p>
                </div>
            </div>
        );
    }

    const colors = [
        { border: 'rgb(74, 124, 44)', background: 'rgba(74, 124, 44, 0.2)' },
        { border: 'rgb(107, 168, 62)', background: 'rgba(107, 168, 62, 0.2)' },
        { border: 'rgb(45, 80, 22)', background: 'rgba(45, 80, 22, 0.2)' },
        { border: 'rgb(139, 195, 74)', background: 'rgba(139, 195, 74, 0.2)' },
    ];

    const groupedData: Record<string, ChartDataPoint[]> = {};
    data.forEach((point) => {
        if (!groupedData[point.sensorId]) {
            groupedData[point.sensorId] = [];
        }
        groupedData[point.sensorId].push(point);
    });

    Object.keys(groupedData).forEach((key) => {
        groupedData[key].sort((a, b) => a.timestamp - b.timestamp);
    });

    const datasets = Object.entries(groupedData).map(([, points]) => {
        const instance = points[0].instance;
        const color = colors[(instance - 1) % colors.length];

        return {
            label: `Instancja #${instance}`,
            data: points.map((point) => ({
                x: point.timestamp,
                y: point.value,
            })),
            borderColor: color.border,
            backgroundColor: color.background,
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 6,
        };
    });

    const chartData = {
        datasets,
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#2d5016',
                    font: {
                        size: 12,
                        weight: 'bold',
                    },
                    padding: 15,
                    usePointStyle: true,
                },
            },
            title: {
                display: true,
                text: sensorType === 'all'
                    ? 'Dane z czujników'
                    : getSensorDisplayName(sensorType),
                color: '#2d5016',
                font: {
                    size: 18,
                    weight: 'bold',
                },
                padding: {
                    top: 10,
                    bottom: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.parsed.y !== null ? context.parsed.y.toFixed(2) : '0';
                        const unit = sensorType !== 'all' ? getSensorUnit(sensorType) : '';
                        return `${context.dataset.label}: ${value} ${unit}`;
                    },
                    title: function (context) {
                        const xValue = context[0].parsed.x ?? Date.now();
                        const date = new Date(xValue);
                        return date.toLocaleString('pl-PL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        });
                    },
                },
                backgroundColor: 'rgba(45, 80, 22, 0.95)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#6ba83e',
                borderWidth: 2,
                padding: 12,
                displayColors: true,
            },
        },
        scales: {
            x: {
                type: 'linear',
                ticks: {
                    callback: function (value) {
                        const date = new Date(value);
                        return date.toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit',
                        });
                    },
                    color: '#4a7c2c',
                    font: {
                        size: 11,
                    },
                },
                grid: {
                    color: 'rgba(107, 168, 62, 0.1)',
                },
                title: {
                    display: true,
                    text: 'Czas',
                    color: '#2d5016',
                    font: {
                        size: 13,
                        weight: 'bold',
                    },
                },
            },
            y: {
                ticks: {
                    color: '#4a7c2c',
                    font: {
                        size: 11,
                    },
                    callback: function (value) {
                        return typeof value === 'number' ? value.toFixed(1) : value;
                    },
                },
                grid: {
                    color: 'rgba(107, 168, 62, 0.1)',
                },
                title: {
                    display: true,
                    text: sensorType !== 'all' ? getSensorUnit(sensorType) : 'Wartość',
                    color: '#2d5016',
                    font: {
                        size: 13,
                        weight: 'bold',
                    },
                },
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    return (
        <div className="chart-container">
            <div className="chart-wrapper">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}

export default SensorChart;
