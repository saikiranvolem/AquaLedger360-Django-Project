import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/customers', name: 'Customers' },
    { path: '/products', name: 'Products & Stock' },
    { path: '/sale', name: 'New Sale' },
    { path: '/payments', name: 'Payments' },
    { path: '/expenses', name: 'Expenses' },
    { path: '/reports', name: 'Reports' },
  ];

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
    </div>
  );
};

export default Sidebar;