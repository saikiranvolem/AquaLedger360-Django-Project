import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Customers.css';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    customer_id: '',
    name: '',
    phone: '',
    village: '',
    pond_size: '',
    outstanding_balance: '',
    next_due_date: '',
    status: 'Active'
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const fetchCustomers = () => {
    axios.get('http://127.0.0.1:8000/api/customers/')
      .then(response => {
        setCustomers(response.data);
      })
      .catch(error => console.error("Error fetching customers:", error));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- DELETE FUNCTION ---
  const handleDelete = (e, id) => {
    e.stopPropagation(); // Prevents the row click from triggering navigation
    if (window.confirm("Are you sure you want to delete this customer? This cannot be undone.")) {
      axios.delete(`http://127.0.0.1:8000/api/customers/${id}/`)
        .then(() => fetchCustomers())
        .catch(error => console.error("Error deleting customer:", error));
    }
  };

  // --- EDIT FUNCTION ---
  const handleEdit = (e, customer) => {
    e.stopPropagation(); // Prevents the row click from triggering navigation
    setEditingId(customer.id);
    setFormData(customer);
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
      axios.put(`http://127.0.0.1:8000/api/customers/${editingId}/`, formData)
        .then(() => {
          fetchCustomers();
          closeModal();
        })
        .catch(error => console.error("Error updating customer:", error));
    } else {
      axios.post('http://127.0.0.1:8000/api/customers/', formData)
        .then(() => {
          fetchCustomers();
          closeModal();
        })
        .catch(error => console.error("Error adding customer:", error));
    }
  };

  const activeCount = customers.filter(c => c.status === 'Active').length;
  const overdueCount = customers.filter(c => c.status === 'Overdue').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Customers</h2>
        <div className="user-info">Owner • Today</div>
      </div>

      <div className="controls-bar">
        <div className="search-section">
          <div className="input-group-inline">
            <label>Search customers</label>
            <input type="text" placeholder="ID, name, phone or village" className="search-input" />
          </div>
          <div className="status-badges">
            <span className="badge-teal">Active {activeCount}</span>
            <span className="badge-orange">Overdue {overdueCount}</span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Customer
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Village</th>
              <th>Pond</th>
              <th>Outstanding</th>
              <th>Next Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((item) => (
              <tr 
                key={item.id} 
                className="table-row"
                onClick={() => navigate(`/customers/${item.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td className="fw-bold">{item.customer_id} • {item.name}</td>
                <td>{item.phone}</td>
                <td>{item.village}</td>
                <td>{item.pond_size}</td>
                <td>₹{item.outstanding_balance}</td>
                <td>{item.next_due_date || '—'}</td>
                <td className={item.status === 'Overdue' ? 'text-danger' : item.status === 'Clear' ? 'text-muted' : 'text-normal'}>
                  {item.status}
                </td>
                <td>
                  <button className="btn-text edit-btn" onClick={(e) => handleEdit(e, item)}>Edit</button>
                  <button className="btn-text delete-btn" onClick={(e) => handleDelete(e, item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row-split">
                <div className="form-group-block">
                  <label>Customer ID</label>
                  <input type="text" name="customer_id" value={formData.customer_id} onChange={handleInputChange} required />
                </div>
                <div className="form-group-block">
                  <label>Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row-split">
                <div className="form-group-block">
                  <label>Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="form-group-block">
                  <label>Village</label>
                  <input type="text" name="village" value={formData.village} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row-split">
                <div className="form-group-block">
                  <label>Pond Size</label>
                  <input type="text" name="pond_size" value={formData.pond_size} onChange={handleInputChange} required />
                </div>
                <div className="form-group-block">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Clear">Clear</option>
                  </select>
                </div>
              </div>

              <div className="form-row-split">
                <div className="form-group-block">
                  <label>Initial Outstanding (₹)</label>
                  <input type="number" step="0.01" name="outstanding_balance" value={formData.outstanding_balance} onChange={handleInputChange} required />
                </div>
                <div className="form-group-block">
                  <label>Next Due Date</label>
                  <input type="text" name="next_due_date" value={formData.next_due_date} onChange={handleInputChange} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;