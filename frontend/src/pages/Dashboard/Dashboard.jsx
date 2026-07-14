import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [custRes, prodRes, invRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/customers/'),
          axios.get('http://127.0.0.1:8000/api/products/'),
          axios.get('http://127.0.0.1:8000/api/invoices/')
        ]);
        
        setCustomers(custRes.data);
        setProducts(prodRes.data);
        setInvoices(invRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  // --- Dashboard Metrics ---
  const totalOutstanding = customers.reduce((sum, c) => sum + parseFloat(c.outstanding_balance), 0);
  const lowStockItems = products.filter(p => Number(p.stock) <= Number(p.reorder_level));
  
  // Calculate today's sales
  const today = new Date().toLocaleDateString();
  const todaysInvoices = invoices.filter(inv => new Date(inv.date).toLocaleDateString() === today);
  const todaysSales = todaysInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Dashboard</h2>
        <div className="user-info">Welcome back, Owner</div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button className="btn-primary" onClick={() => navigate('/sale')}>+ New Sale</button>
        <button className="btn-cancel" onClick={() => navigate('/payments')} style={{ backgroundColor: '#fff' }}>Record Payment</button>
      </div>

      {/* KPI Cards */}
      <div className="summary-grid mb-30">
        <div className="summary-box border-teal">
          <p>Today's Sales</p>
          <h3>₹ {todaysSales.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
          <span className="text-muted">{todaysInvoices.length} transactions today</span>
        </div>
        
        <div className="summary-box border-orange">
          <p>Total Market Outstanding</p>
          <h3 className="text-orange">₹ {totalOutstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
          <span className="text-muted">From {customers.filter(c => parseFloat(c.outstanding_balance) > 0).length} customers</span>
        </div>
        
        <div className="summary-box border-red">
          <p>Low Stock Alerts</p>
          <h3 className="text-danger">{lowStockItems.length}</h3>
          <span className="text-muted">Items require reordering</span>
        </div>
      </div>

      {/* Alerts & Quick Look */}
      <div className="card-box" style={{ maxWidth: '800px' }}>
        <h3 style={{ marginBottom: '15px', color: '#d9534f' }}>Inventory Warnings</h3>
        {lowStockItems.length === 0 ? (
          <p style={{ color: '#5cb85c', fontWeight: 'bold' }}>All stock levels are healthy!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px 0' }}>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{item.sku_name}</td>
                  <td>{item.category}</td>
                  <td style={{ color: '#d9534f', fontWeight: 'bold' }}>{item.stock} {item.unit}</td>
                  <td>{item.reorder_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;