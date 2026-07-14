import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import Components
import Sidebar from './components/Sidebar/Sidebar'; // Assuming you have a Sidebar component
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Customers from './pages/Customers/Customers';
import CustomerDetails from './pages/Customers/CustomerDetails';
import Products from './pages/Products/Products';
import Sale from './pages/Sale/Sale';
import Payments from './pages/Payments/Payments';
import Expenses from './pages/Expenses/Expenses';
import Reports from './pages/Reports/Reports';

// --- AXIOS GLOBAL INTERCEPTOR ---
// This automatically attaches the token to every single API request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- PROTECTED ROUTE COMPONENT ---
// This acts as a bouncer. No token? Go back to login!
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* PROTECTED ROUTES (Requires Login) */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div style={{ display: 'flex' }}>
              <Sidebar />
              <div style={{ flex: 1, marginLeft: '250px', backgroundColor: '#f5f8f9', minHeight: '100vh' }}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/:id" element={<CustomerDetails />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/sale" element={<Sale />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;