import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Customers.css';

const CustomerDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State to track which tab is currently selected
  const [activeTab, setActiveTab] = useState('Ledger');

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const custRes = await axios.get(`http://127.0.0.1:8000/api/customers/${id}/`);
        setCustomer(custRes.data);

        const [invRes, payRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/invoices/'),
          axios.get('http://127.0.0.1:8000/api/payments/')
        ]);

        setInvoices(invRes.data.filter(inv => inv.customer === Number(id)));
        setPayments(payRes.data.filter(pay => pay.customer === Number(id)));
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customer details:", error);
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  if (loading) {
    return <div className="page-container"><h2>Loading customer details...</h2></div>;
  }

  if (!customer) {
    return <div className="page-container"><h2>Customer not found.</h2></div>;
  }

  const totalPurchases = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
  const totalPayments = payments.reduce((sum, pay) => sum + parseFloat(pay.amount), 0);

  const ledger = [
    ...invoices.map(i => ({ 
      id: `inv-${i.id}`, date: i.date, ref: `INV-${i.id}`, desc: `Sale (${i.sale_type})`, debit: parseFloat(i.total_amount), credit: null 
    })),
    ...payments.map(p => ({ 
      id: `pay-${p.id}`, date: p.date, ref: `PAY-${p.id}`, desc: `Payment (${p.mode})`, debit: null, credit: parseFloat(p.amount) 
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'block' }}>
        <button 
          onClick={() => navigate('/customers')} 
          style={{ background: 'none', border: 'none', color: '#118a8b', cursor: 'pointer', marginBottom: '15px' }}
        >
          ← Back to customers
        </button>
        <h2>Customer Details</h2>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '5px' }}>{customer.name}</h3>
        <p className="text-muted">{customer.customer_id} • {customer.phone} • {customer.village}</p>
      </div>

      <div className="summary-grid mb-30">
        <div className="summary-box border-orange">
          <p>Current Outstanding</p>
          <h3 className="text-orange">₹ {parseFloat(customer.outstanding_balance).toLocaleString()}</h3>
          <span className="text-muted">Pond Size: {customer.pond_size}</span>
        </div>
        
        <div className="summary-box border-teal">
          <p>Total Purchases</p>
          <h3>₹ {totalPurchases.toLocaleString()}</h3>
          <span className="text-muted">{invoices.length} invoices on record</span>
        </div>
        
        <div className="summary-box" style={{ borderLeft: '4px solid #5cb85c' }}>
          <p>Total Payments</p>
          <h3>₹ {totalPayments.toLocaleString()}</h3>
          <span className="text-muted">{payments.length} payments received</span>
        </div>
      </div>

      <div className="card-box">
        {/* INTERACTIVE TABS */}
        <div style={{ display: 'flex', gap: '30px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          {['Ledger', 'Invoices', 'Payments', 'Profile'].map((tabName) => (
            <span 
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              style={{ 
                cursor: 'pointer',
                color: activeTab === tabName ? '#118a8b' : '#888', 
                fontWeight: activeTab === tabName ? 'bold' : 'normal', 
                borderBottom: activeTab === tabName ? '2px solid #118a8b' : 'none', 
                paddingBottom: '11px',
                marginBottom: '-11px' // Pulls the border down to overlap the container's border
              }}
            >
              {tabName}
            </span>
          ))}
        </div>

        {/* TAB 1: LEDGER */}
        {activeTab === 'Ledger' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px 0' }}>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Debit (₹)</th>
                <th>Credit (₹)</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px 0' }}>{new Date(row.date).toLocaleDateString()}</td>
                  <td className="text-muted">{row.ref}</td>
                  <td>{row.desc}</td>
                  <td style={{ color: row.debit ? '#d9534f' : 'inherit', fontWeight: row.debit ? 'bold' : 'normal' }}>
                    {row.debit ? row.debit.toLocaleString() : '—'}
                  </td>
                  <td style={{ color: row.credit ? '#5cb85c' : 'inherit', fontWeight: row.credit ? 'bold' : 'normal' }}>
                    {row.credit ? row.credit.toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
              {ledger.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No transaction history available.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* TAB 2: INVOICES ONLY */}
        {activeTab === 'Invoices' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px 0' }}>Date</th>
                <th>Invoice Ref</th>
                <th>Sale Type</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px 0' }}>{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="text-muted fw-bold">INV-{inv.id}</td>
                  <td>{inv.sale_type}</td>
                  <td className="fw-bold">₹ {parseFloat(inv.total_amount).toLocaleString()}</td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No invoices recorded.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* TAB 3: PAYMENTS ONLY */}
        {activeTab === 'Payments' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px 0' }}>Date</th>
                <th>Payment Ref</th>
                <th>Mode</th>
                <th>Bank Ref / Notes</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => (
                <tr key={pay.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px 0' }}>{new Date(pay.date).toLocaleDateString()}</td>
                  <td className="text-muted fw-bold">PAY-{pay.id}</td>
                  <td>{pay.mode}</td>
                  <td>{pay.reference_number || pay.notes || '—'}</td>
                  <td className="fw-bold text-teal">₹ {parseFloat(pay.amount).toLocaleString()}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No payments recorded.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'Profile' && (
          <div style={{ padding: '20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <p className="text-muted" style={{ marginBottom: '5px' }}>Customer ID</p>
              <h4 style={{ marginBottom: '20px' }}>{customer.customer_id}</h4>
              
              <p className="text-muted" style={{ marginBottom: '5px' }}>Phone Number</p>
              <h4 style={{ marginBottom: '20px' }}>{customer.phone}</h4>
              
              <p className="text-muted" style={{ marginBottom: '5px' }}>Status</p>
              <span className={`badge-${customer.status === 'Overdue' ? 'orange' : 'teal'}`}>{customer.status}</span>
            </div>
            <div>
              <p className="text-muted" style={{ marginBottom: '5px' }}>Village / Location</p>
              <h4 style={{ marginBottom: '20px' }}>{customer.village}</h4>
              
              <p className="text-muted" style={{ marginBottom: '5px' }}>Pond Size</p>
              <h4 style={{ marginBottom: '20px' }}>{customer.pond_size}</h4>
              
              <p className="text-muted" style={{ marginBottom: '5px' }}>Next Scheduled Due Date</p>
              <h4>{customer.next_due_date || 'Not set'}</h4>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;