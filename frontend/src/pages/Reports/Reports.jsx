import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';

const Reports = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // Fetch all data required for the reports simultaneously
    const fetchReportData = async () => {
      try {
        const [invRes, payRes, expRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/invoices/'),
          axios.get('http://127.0.0.1:8000/api/payments/'),
          axios.get('http://127.0.0.1:8000/api/expenses/')
        ]);
        
        setInvoices(invRes.data);
        setPayments(payRes.data);
        setExpenses(expRes.data);
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };

    fetchReportData();
  }, []);

  // --- Dynamic Calculations ---
  const totalSales = invoices.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
  const totalCollections = payments.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const grossProfit = totalSales - totalExpenses;

  // Filter Sales by Type
  const cashSales = invoices.filter(i => i.sale_type === 'Cash' || i.sale_type === 'UPI')
                            .reduce((sum, i) => sum + parseFloat(i.total_amount), 0);
  const creditSales = invoices.filter(i => i.sale_type === 'Credit')
                              .reduce((sum, i) => sum + parseFloat(i.total_amount), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Reports</h2>
        <div className="user-info">Owner • Overall Summary</div>
      </div>

      {/* Top Summary Metrics */}
      <div className="summary-grid mb-30">
        <div className="summary-box">
          <p>Total Sales</p>
          <h3>₹ {totalSales.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
          <span className="text-muted">Cash: ₹{cashSales.toLocaleString()} • Credit: ₹{creditSales.toLocaleString()}</span>
        </div>
        
        <div className="summary-box">
          <p>Collections (Payments)</p>
          <h3>₹ {totalCollections.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
          <span className="text-muted">Total money received</span>
        </div>
        
        <div className="summary-box">
          <p>Total Expenses</p>
          <h3>₹ {totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
          <span className="text-muted">Operational costs</span>
        </div>
      </div>

      {/* Business Summary Layout */}
      <div className="reports-layout" style={{ display: 'flex', gap: '20px' }}>
        <div className="card-box" style={{ flex: '2' }}>
          <h3>Recent Transactions</h3>
          <table style={{ width: '100%', marginTop: '15px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(-5).reverse().map(inv => (
                <tr key={`inv-${inv.id}`}>
                  <td>{new Date(inv.date).toLocaleDateString()}</td>
                  <td>Sale ({inv.sale_type})</td>
                  <td className="fw-bold text-teal">+ ₹{parseFloat(inv.total_amount).toLocaleString()}</td>
                </tr>
              ))}
              {expenses.slice(-3).reverse().map(exp => (
                <tr key={`exp-${exp.id}`}>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>Expense ({exp.category})</td>
                  <td className="fw-bold text-danger">- ₹{parseFloat(exp.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-box" style={{ flex: '1' }}>
          <h3>Business Summary</h3>
          <div style={{ marginTop: '20px', lineHeight: '2.5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Gross Sales:</span>
              <strong>₹ {totalSales.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Expenses:</span>
              <strong className="text-danger">- ₹ {totalExpenses.toLocaleString()}</strong>
            </div>
            <hr style={{ border: '0.5px solid #eee', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
              <span>Net Profit:</span>
              <strong className={grossProfit >= 0 ? 'text-teal' : 'text-danger'}>
                ₹ {grossProfit.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;