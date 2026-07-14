import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Tracks if we are editing an existing item

  const initialFormState = {
    sku_name: '',
    category: 'Feed',
    unit: '',
    stock: '',
    reorder_level: '',
    buy_price: '',
    sell_price: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchProducts = () => {
    axios.get('http://127.0.0.1:8000/api/products/')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => console.error("Error fetching products:", error));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- NEW: DELETE FUNCTION ---
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios.delete(`http://127.0.0.1:8000/api/products/${id}/`)
        .then(() => {
          fetchProducts(); // Refresh table after deleting
        })
        .catch(error => console.error("Error deleting product:", error));
    }
  };

  // --- NEW: OPEN EDIT MODAL FUNCTION ---
  const handleEdit = (product) => {
    setEditingId(product.id); // Mark that we are editing, not creating
    setFormData(product); // Pre-fill the form with this product's data
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState); // Reset form
  };

  // --- UPDATED: SUBMIT FUNCTION ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // UPDATE (PUT) if we have an editingId
      axios.put(`http://127.0.0.1:8000/api/products/${editingId}/`, formData)
        .then(() => {
          fetchProducts();
          closeModal();
        })
        .catch(error => console.error("Error updating product:", error));
    } else {
      // CREATE (POST) if we don't have an editingId
      axios.post('http://127.0.0.1:8000/api/products/', formData)
        .then(() => {
          fetchProducts();
          closeModal();
        })
        .catch(error => console.error("Error adding product:", error));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Products & Stock</h2>
        <div className="user-info">Owner • Today</div>
      </div>

      <div className="controls-bar">
        <div className="search-filters">
          <div className="input-group-inline">
            <label>Search products</label>
            <input type="text" placeholder="SKU or product name" />
          </div>
          <div className="input-group-inline">
            <label>Category</label>
            <select>
              <option>All categories</option>
              <option>Feed</option>
              <option>Medicine</option>
              <option>Treatment</option>
            </select>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Product
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Stock</th>
              <th>Reorder Level</th>
              <th>Buy Price</th>
              <th>Sell Price</th>
              <th>Status</th>
              <th>Actions</th> {/* NEW ACTIONS HEADER */}
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id}>
                <td className="fw-bold">{item.sku_name}</td>
                <td>{item.category}</td>
                <td>{item.unit}</td>
                <td>{item.stock}</td>
                <td>{item.reorder_level}</td>
                <td>₹{item.buy_price}</td>
                <td>₹{item.sell_price}</td>
                <td className={Number(item.stock) <= Number(item.reorder_level) ? 'text-danger fw-bold' : 'text-normal'}>
                  {Number(item.stock) <= Number(item.reorder_level) ? 'Low' : 'In stock'}
                </td>
                {/* NEW ACTIONS CELL */}
                <td>
                  <button className="btn-text edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="btn-text delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary-section">
        <div className="summary-card">
          <h4>Stock Summary</h4>
          <div className="summary-stats">
            <div>
              <p>Total SKUs</p>
              <h3>{products.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Change title based on edit mode */}
            <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group-block">
                <label>Product / SKU Name</label>
                <input type="text" name="sku_name" value={formData.sku_name} onChange={handleInputChange} required />
              </div>

              <div className="form-row-split">
                <div className="form-group-block">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="Feed">Feed</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Treatment">Treatment</option>
                  </select>
                </div>
                <div className="form-group-block">
                  <label>Unit Measurement</label>
                  <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row-split">
                <div className="form-group-block">
                  <label>Stock Qty</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required />
                </div>
                <div className="form-group-block">
                  <label>Reorder Alert Level</label>
                  <input type="number" name="reorder_level" value={formData.reorder_level} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row-split">
                <div className="form-group-block">
                  <label>Buying Price (₹)</label>
                  <input type="number" step="0.01" name="buy_price" value={formData.buy_price} onChange={handleInputChange} required />
                </div>
                <div className="form-group-block">
                  <label>Selling Price (₹)</label>
                  <input type="number" step="0.01" name="sell_price" value={formData.sell_price} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;