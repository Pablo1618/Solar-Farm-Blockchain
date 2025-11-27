import React, { useState, useEffect } from 'react';
import './Admin.css';

interface SensorStatus {
    deviceName: string;
    walletAddress: string;
    tokenBalance: number;
}

function Admin() {
    const [sensors, setSensors] = useState<SensorStatus[]>([]);
    const [loading, setLoading] = useState(true);

    const generateWalletAddress = () => {
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    };

    const generateTokenBalance = () => {
        return Math.floor(Math.random() * 1000) + Math.random();
    };

    useEffect(() => {
        const fetchSensors = async () => {
            setLoading(true);
            try {
                const response = await fetch('/dashboard');
                if (!response.ok) {
                    throw new Error('Failed to fetch sensors');
                }
                const data = await response.json();

                const uniqueDevices = new Set<string>();
                data.forEach((item: { deviceName: string }) => {
                    uniqueDevices.add(item.deviceName);
                });

                const sensorStatuses: SensorStatus[] = Array.from(uniqueDevices).map(deviceName => ({
                    deviceName,
                    walletAddress: generateWalletAddress(),
                    tokenBalance: generateTokenBalance(),
                }));

                sensorStatuses.sort((a, b) => a.deviceName.localeCompare(b.deviceName));

                setSensors(sensorStatuses);
            } catch (error) {
                console.error('Error fetching sensors:', error);
                setSensors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSensors();
    }, []);

    const totalBalance = sensors.reduce((sum, s) => sum + s.tokenBalance, 0);

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <h1>Panel Administratora</h1>
                <p className="admin-subtitle">
                    Status sensorów i salda tokenów blockchain
                </p>
            </div>

            <div className="admin-summary">
                <div className="summary-card">
                    <span className="summary-label">Liczba sensorów</span>
                    <span className="summary-value">{sensors.length}</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Łączne saldo tokenów</span>
                    <span className="summary-value">{totalBalance.toFixed(2)}</span>
                </div>
            </div>

            {loading ? (
                <div className="loading-indicator">Ładowanie danych...</div>
            ) : sensors.length === 0 ? (
                <div className="no-data">Brak danych o sensorach</div>
            ) : (
                <div className="sensors-table-container">
                    <table className="sensors-table">
                        <thead>
                            <tr>
                                <th>Urządzenie</th>
                                <th>Adres portfela</th>
                                <th>Saldo tokenów</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sensors.map((sensor) => (
                                <tr key={sensor.deviceName}>
                                    <td className="device-name">{sensor.deviceName}</td>
                                    <td className="wallet-address">
                                        <code>{sensor.walletAddress}</code>
                                    </td>
                                    <td className="token-balance">{sensor.tokenBalance.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Admin;
