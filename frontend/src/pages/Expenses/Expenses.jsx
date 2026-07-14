import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    category: 'Transport',
    description: '',
    mode: 'UPI',
    amount: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const fetchExpenses = () => {
    axios.get('http://127.0.0.1:8000/api/expenses/')
      .then(response => setExpenses(response.data))
      .catch(error => console.error("Error fetching expenses:", error));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- DELETE FUNCTION ---
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      axios.delete(`http://127.0.0.1:8000/api/expenses/${id}/`)
        .then(() => fetchExpenses())
        .catch(error => console.error("Error deleting expense:", error));
    }
  };

  // --- EDIT FUNCTION ---
  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setFormData(expense);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // --- SUBMIT (CREATE & UPDATE) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      axios.put(`http://127.0.0.1:8000/api/expenses/${editingId}/`, formData)
        .then(() => {
          fetchExpenses();
          closeModal();
        })
        .catch(error => console.error("Error updating expense:", error));
    } else {
      axios.post('http://127.0.0.1:8000/api/expenses/', formData)
        .then(() => {
          fetchExpenses();
          closeModal();
        })
        .catch(error => console.error("Error adding expense:", error));
    }
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Expenses</h2>
          <div className="user-info">Owner • Today</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Expense</button>
      </div>

      <div className="summary-grid mb-30">
        <div className="summary-box border-orange">
          <p>Total Recorded</p>
          <h3>₹ {totalExpenses.toLocaleString()}</h3>
          <span>{expenses.length} entries</span>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Mode</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((item) => (
              <tr key={item.id}>
                <td className="fw-bold">{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.category}</td>
                <td>{item.description}</td>
                <td>{item.mode}</td>
                <td className="fw-bold">₹{item.amount}</td>
                <td>
                  <button className="btn-text edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="btn-text delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? 'Edit Expense' : 'Add New Expense'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row-split">
                <div className="form-group-block">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="Transport">Transport</option>
                    <option value="Loading">Loading</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Salary">Salary</option>
                    <option value="Rent">Rent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group-block">
                  <label>Payment Mode</label>
                  <select name="mode" value={formData.mode} onChange={handleInputChange}>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="form-group-block">
                <label>Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleInputChange} required />
              </div>

              <div className="form-group-block">
                <label>Amount (₹)</label>
                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} required />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;