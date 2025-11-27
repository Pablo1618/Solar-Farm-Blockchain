import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <span className="solar-icon">☀️</span>
                    <span className="brand-text">Solar Farm</span>
                </div>
                <ul className="navbar-menu">
                    <li>
                        <Link to="/" className={isActive('/')}>
                            Strona Główna
                        </Link>
                    </li>
                    <li>
                        <Link to="/pulpit" className={isActive('/pulpit')}>
                            Pulpit
                        </Link>
                    </li>
                    <li>
                        <Link to="/wykresy" className={isActive('/wykresy')}>
                            Wykresy
                        </Link>
                    </li>
                    <li>
                        <Link to="/dane" className={isActive('/dane')}>
                            Dane
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin" className={isActive('/admin')}>
                            Admin
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
