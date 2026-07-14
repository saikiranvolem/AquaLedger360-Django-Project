import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Payments.css';

const Payments = () => {
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    customer: '',
    amount: '',
    mode: 'UPI',
    reference_number: '',
    notes: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  // Fetch both customers (for the dropdown) and payments (for the table)
  const fetchData = () => {
    axios.get('http://127.0.0.1:8000/api/customers/')
      .then(response => setCustomers(response.data))
      .catch(error => console.error("Error fetching customers:", error));
      
    axios.get('http://127.0.0.1:8000/api/payments/')
      .then(response => setPayments(response.data))
      .catch(error => console.error("Error fetching payments:", error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- DELETE FUNCTION ---
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this payment? It will affect the customer's balance.")) {
      axios.delete(`http://127.0.0.1:8000/api/payments/${id}/`)
        .then(() => fetchData())
        .catch(error => console.error("Error deleting payment:", error));
    }
  };

  // --- EDIT FUNCTION ---
  const handleEdit = (payment) => {
    setEditingId(payment.id);
    setFormData(payment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  // --- SUBMIT (CREATE & UPDATE) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer) {
      alert("Please select a customer first.");
      return;
    }

    if (editingId) {
      axios.put(`http://127.0.0.1:8000/api/payments/${editingId}/`, formData)
        .then(() => {
          fetchData();
          cancelEdit();
        })
        .catch(error => console.error("Error updating payment:", error));
    } else {
      axios.post('http://127.0.0.1:8000/api/payments/', formData)
        .then(() => {
          fetchData();
          cancelEdit();
        })
        .catch(error => console.error("Error saving payment:", error));
    }
  };

  // Helper to get customer name for the table
  const getCustomerName = (id) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Payments</h2>
        <div className="user-info">Owner • Today</div>
      </div>

      <div className="payments-layout" style={{ display: 'flex', gap: '20px' }}>
        
        {/* Left Side: Payment Form */}
        <div className="record-payment-card card-box" style={{ flex: '1', height: 'fit-content' }}>
          <h3>{editingId ? 'Edit Payment' : 'Record Payment'}</h3>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group-block mt-20">
              <label>Select Customer</label>
              <select name="customer" value={formData.customer} onChange={handleInputChange} required>
                <option value="">-- Choose a Customer --</option>
                {customers.map(cust => (
                  <option key={cust.id} value={cust.id}>
                    {cust.customer_id} - {cust.name} (Due: ₹{cust.outstanding_balance})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row mt-20">
              <div className="input-group">
                <label>Amount</label>
                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label>Payment mode</label>
                <select name="mode" value={formData.mode} onChange={handleInputChange}>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="input-group mt-20">
              <label>Reference number</label>
              <input type="text" name="reference_number" value={formData.reference_number || ''} onChange={handleInputChange} />
            </div>

            <div className="input-group mt-20">
              <label>Notes</label>
              <input type="text" name="notes" value={formData.notes || ''} onChange={handleInputChange} />
            </div>

            <div className="btn-right-align mt-25" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {editingId && (
                <button type="button" className="btn-cancel" onClick={cancelEdit}>Cancel</button>
              )}
              <button type="submit" className="btn-primary px-40">
                {editingId ? 'Update Payment' : 'Save Payment'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Payment History Table */}
        <div className="card-box" style={{ flex: '2' }}>
          <h3>Recent Payments</h3>
          <table style={{ width: '100%', marginTop: '15px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px 0' }}>Date</th>
                <th>Customer</th>
                <th>Mode</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice().reverse().map((pay) => (
                <tr key={pay.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 0' }}>{new Date(pay.date).toLocaleDateString()}</td>
                  <td className="fw-bold">{getCustomerName(pay.customer)}</td>
                  <td>{pay.mode}</td>
                  <td className="fw-bold text-teal">₹{parseFloat(pay.amount).toLocaleString()}</td>
                  <td>
                    <button className="btn-text edit-btn" onClick={() => handleEdit(pay)}>Edit</button>
                    <button className="btn-text delete-btn" onClick={() => handleDelete(pay.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No payments recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Payments;