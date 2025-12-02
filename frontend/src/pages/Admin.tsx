import React, { useState, useEffect } from 'react';
import './Admin.css';

interface BlockchainWalletData {
    dataType_deviceName: string;
    walletAddress: string;
    tokenBalance: string;
}

interface SensorStatus {
    sensorId: string;
    walletAddress: string;
    tokenBalance: number;
}

function Admin() {
    const [sensors, setSensors] = useState<SensorStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSensors = async () => {
            setLoading(true);
            try {
                const response = await fetch('/blockchain/sensors-status');
                if (!response.ok) {
                    throw new Error('Failed to fetch sensors');
                }
                const data: BlockchainWalletData[] = await response.json();

                const sensorStatuses: SensorStatus[] = data.map((item) => ({
                    sensorId: item.dataType_deviceName,
                    walletAddress: item.walletAddress,
                    tokenBalance: parseFloat(item.tokenBalance) || 0,
                }));

                sensorStatuses.sort((a, b) => a.sensorId.localeCompare(b.sensorId));

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
                                <tr key={sensor.sensorId}>
                                    <td className="device-name">{sensor.sensorId}</td>
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
