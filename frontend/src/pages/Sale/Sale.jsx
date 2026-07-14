import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Sale.css';

const Sale = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  // Sale State
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cart, setCart] = useState([]);
  const [saleType, setSaleType] = useState('Credit');
  const [discount, setDiscount] = useState('');
  
  // Current Item Input State
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch all necessary data
  const fetchData = async () => {
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
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ADD ITEM TO CART ---
  const handleAddItem = () => {
    if (!selectedProduct || quantity < 1) return;
    
    const prod = products.find(p => p.id === parseInt(selectedProduct));
    if (!prod) return;

    const newItem = {
      product_id: prod.id,
      name: prod.sku_name,
      quantity: parseInt(quantity),
      rate: parseFloat(prod.sell_price),
      total: parseInt(quantity) * parseFloat(prod.sell_price)
    };

    setCart([...cart, newItem]);
    setSelectedProduct('');
    setQuantity(1);
  };

  // Math Calculations for POS
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountVal = parseFloat(discount) || 0;
  const finalTotal = cartTotal - discountVal;

  const customerObj = customers.find(c => c.id === parseInt(selectedCustomer));
  const currentOutstanding = customerObj ? parseFloat(customerObj.outstanding_balance) : 0;
  
  // If credit sale, it increases their debt.
  const newOutstanding = saleType === 'Credit' ? currentOutstanding + finalTotal : currentOutstanding;

  // --- COMPLETE SALE & UPDATE CUSTOMER ---
  const handleCompleteSale = () => {
    if (!selectedCustomer) {
      alert("Please select a customer."); return;
    }
    if (cart.length === 0) {
      alert("Cart is empty!"); return;
    }

    const invoiceData = {
      customer: selectedCustomer,
      total_amount: finalTotal,
      discount: discountVal,
      sale_type: saleType,
      new_outstanding: newOutstanding
    };

    // 1. Create Invoice
    axios.post('http://127.0.0.1:8000/api/invoices/', invoiceData)
      .then(res => {
        const invoiceId = res.data.id;
        
        // 2. Loop through cart and create Invoice Items
        const itemPromises = cart.map(item => {
          return axios.post('http://127.0.0.1:8000/api/invoice-items/', {
            invoice: invoiceId,
            product: item.product_id,
            quantity: item.quantity,
            rate: item.rate,
            total: item.total
          });
        });

        // 3. Update the Customer's Outstanding Balance in the database!
        const updatedCustomer = {
          ...customerObj,
          outstanding_balance: newOutstanding.toFixed(2)
        };
        const customerPromise = axios.put(`http://127.0.0.1:8000/api/customers/${selectedCustomer}/`, updatedCustomer);

        // Wait for items to save AND customer balance to update
        Promise.all([...itemPromises, customerPromise]).then(() => {
          alert("Sale completed and saved to ledger!");
          setCart([]);
          setSelectedCustomer('');
          setDiscount('');
          setSaleType('Credit');
          fetchData(); // Refresh tables and dropdowns
        });
      })
      .catch(error => console.error("Error saving sale:", error));
  };

  // --- DELETE SALE & REVERT BALANCE ---
  const handleDeleteSale = async (invoice) => {
    if (window.confirm(`Are you sure you want to delete Invoice INV-${invoice.id}? This will reverse the transaction.`)) {
      try {
        // 1. Revert customer balance if it was a Credit sale
        if (invoice.sale_type === 'Credit') {
          const cust = customers.find(c => c.id === invoice.customer);
          if (cust) {
            const revertedBalance = parseFloat(cust.outstanding_balance) - parseFloat(invoice.total_amount);
            await axios.put(`http://127.0.0.1:8000/api/customers/${cust.id}/`, {
              ...cust,
              outstanding_balance: revertedBalance.toFixed(2)
            });
          }
        }

        // 2. Delete invoice (Django automatically deletes associated InvoiceItems via CASCADE)
        await axios.delete(`http://127.0.0.1:8000/api/invoices/${invoice.id}/`);
        fetchData(); // Refresh UI
      } catch (error) {
        console.error("Error deleting sale:", error);
      }
    }
  };

  const getCustomerName = (id) => {
    const cust = customers.find(c => c.id === id);
    return cust ? cust.name : 'Unknown';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>New Sale</h2>
        <div className="user-info">Owner • Today</div>
      </div>

      <div className="customer-search-section">
        <label>Select Customer</label>
        <select 
          className="full-width-input" 
          value={selectedCustomer} 
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">-- Choose Customer --</option>
          {customers.map(c => (
             <option key={c.id} value={c.id}>{c.customer_id} • {c.name}</option>
          ))}
        </select>
      </div>

      <div className="sale-layout">
        {/* Left Side: Cart & Products */}
        <div className="invoice-section card-box">
          <h3>Invoice Items</h3>
          
          <div className="add-item-row">
            <div className="input-group">
              <label>Product</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku_name} (₹{p.sell_price})</option>
                ))}
              </select>
            </div>
            <div className="input-group qty-group">
              <label>Quantity</label>
              <input type="number" value={quantity} min="1" onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <button className="btn-primary add-btn" onClick={handleAddItem}>Add Item</button>
          </div>

          <div className="table-container no-margin">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((row, index) => (
                  <tr key={index}>
                    <td className="fw-bold">{row.name}</td>
                    <td>{row.quantity}</td>
                    <td>₹{row.rate}</td>
                    <td className="fw-bold">₹{row.total}</td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', color: '#888'}}>Cart is empty</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Totals & Checkout */}
        <div className="summary-section card-box">
          <h3>Sale Summary</h3>
          
          <div className="summary-row">
            <span>Customer outstanding</span>
            <span className="fw-bold">₹ {currentOutstanding.toFixed(2)}</span>
          </div>
          <div className="summary-row border-bottom-light">
            <span>Current sale</span>
            <span className="fw-bold">₹ {cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row mt-15">
            <span className="fw-bold">New outstanding</span>
            <h2 className="text-orange">₹ {newOutstanding.toFixed(2)}</h2>
          </div>

          <div className="input-group mt-20">
            <label>Sale type</label>
            <select className="full-width-input" value={saleType} onChange={(e) => setSaleType(e.target.value)}>
              <option value="Credit">Credit</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
            </select>
          </div>

          <div className="input-group mt-15">
            <label>Discount (₹)</label>
            <input type="number" className="full-width-input" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0.00" />
          </div>

          <button className="btn-primary complete-sale-btn" onClick={handleCompleteSale}>Complete Sale</button>
        </div>
      </div>

      {/* NEW: RECENT SALES LOG */}
      <div className="card-box" style={{ marginTop: '30px' }}>
        <h3>Recent Sales History</h3>
        <table style={{ width: '100%', marginTop: '15px', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '10px 0' }}>Date</th>
              <th>Invoice No.</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.slice().reverse().slice(0, 10).map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '10px 0' }}>{new Date(inv.date).toLocaleDateString()}</td>
                <td className="fw-bold">INV-{inv.id}</td>
                <td>{getCustomerName(inv.customer)}</td>
                <td>{inv.sale_type}</td>
                <td className="fw-bold text-teal">₹{parseFloat(inv.total_amount).toLocaleString()}</td>
                <td>
                  <button className="btn-text delete-btn" onClick={() => handleDeleteSale(inv)}>Delete</button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No sales recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Sale;