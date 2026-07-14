import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; 

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', credentials);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email/username or password.');
    }
  };

  return (
    <div className="login-container">
      {/* LEFT PANEL: Branding & Features */}
      <div className="login-left">
        <div className="left-content">
          <h1 className="brand-title">AquaLedger 360</h1>
          <p className="brand-subtitle">
            Manage stock, customer credit and monthly business from one place.
          </p>

          <div className="features-card">
            <h4>Built for aqua stores</h4>
            <div className="feature-item">
              <span>✓</span> Live stock visibility
            </div>
            <div className="feature-item">
              <span>✓</span> Customer credit tracking
            </div>
            <div className="feature-item">
              <span>✓</span> Partial payment records
            </div>
            <div className="feature-item">
              <span>✓</span> Monthly business reports
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">Sign in to continue</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email or mobile</label>
              <input 
                type="text" 
                name="username" 
                placeholder="owner@aqualedger.com"
                value={credentials.username} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••"
                value={credentials.password} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="forgot-password">
              <a href="#forgot">Forgot password?</a>
            </div>

            <button type="submit" className="btn-signin">
              Sign in
            </button>
          </form>

          <p className="demo-text">Demo roles: Owner and Admin</p>
        </div>
      </div>
    </div>
  );
};

export default Login;