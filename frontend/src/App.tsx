import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import RFPCreate from './pages/RFPCreate';
import RFPDetail from './pages/RFPDetail';
import VendorManagement from './pages/VendorManagement';
import './App.css';

function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          RFP Management System
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/rfp/create" className={`nav-link ${isActive('/rfp/create') ? 'active' : ''}`}>
            Create RFP
          </Link>
          <Link to="/vendors" className={`nav-link ${isActive('/vendors') ? 'active' : ''}`}>
            Vendors
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rfp/create" element={<RFPCreate />} />
            <Route path="/rfp/:id" element={<RFPDetail />} />
            <Route path="/vendors" element={<VendorManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

