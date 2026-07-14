import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/customers', name: 'Customers' },
    { path: '/products', name: 'Products & Stock' },
    { path: '/sale', name: 'New Sale' },
    { path: '/payments', name: 'Payments' },
    { path: '/expenses', name: 'Expenses' },
    { path: '/reports', name: 'Reports' },
  ];

  // --- LOGOUT FUNCTION ---
  const handleLogout = () => {
    // 1. Throw away the VIP wristband (delete token)
    localStorage.removeItem('token');
    
    // 2. Kick the user back to the login screen
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h2>AquaLedger 360</h2>
        <p>Shrimp Store Manager</p>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* NEW: Logout Button pushed to the bottom */}
      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          ← Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;