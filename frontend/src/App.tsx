import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SensorProvider } from './context/SensorContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Data from './pages/Data';
import './App.css';

function App() {
  return (
    <SensorProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pulpit" element={<Dashboard />} />
            <Route path="/wykresy" element={<Charts />} />
            <Route path="/dane" element={<Data />} />
          </Routes>
        </div>
      </Router>
    </SensorProvider>
  );
}

export default App;
