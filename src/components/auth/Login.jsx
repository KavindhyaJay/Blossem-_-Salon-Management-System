import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  LogIn, 
  Eye, 
  EyeOff,
  Shield,
  Users,
  User,
  Building,
  AlertCircle
} from 'lucide-react';
import '../../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:8081';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      let response;
      let role = '';
      let userData = null;
      let firstLogin = false;

      // Try admin login first
      try {
        console.log('Trying admin login...');
        response = await axios.post(`${API_BASE_URL}/api/admin/auth/login`, { 
          email, 
          password 
        });
        role = response.data.role || 'ADMIN';
        userData = response.data.admin || response.data.user;
        console.log('✅ Admin login successful:', { role, userData });
      } catch (adminError) {
        console.log('Admin login failed, trying staff...');
        
        // Try staff login
        try {
          response = await axios.post(`${API_BASE_URL}/api/staff/auth/login`, { 
            email, 
            password 
          });
          role = response.data.role || 'STAFF';
          userData = response.data.staff;
          firstLogin = response.data.firstLogin || false;
          console.log('✅ Staff login successful:', { role, firstLogin });
        } catch (staffError) {
          console.log('Staff login failed, trying reception...');
          
          // Try reception login
          response = await axios.post(`${API_BASE_URL}/api/reception/auth/login`, { 
            email, 
            password 
          });
          role = response.data.role || 'RECEPTION';
          userData = response.data.reception;
          firstLogin = response.data.firstLogin || false;
          console.log('✅ Reception login successful:', { role, firstLogin });
        }
      }

      // Check if we have user data
      if (!userData) {
        throw new Error('No user data received');
      }

      // Handle first login activation
      if (firstLogin) {
        alert('Account activated successfully! Please login again.');
        setPassword('');
        setLoading(false);
        return;
      }

      // Store user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: userData.id || userData._id,
        name: userData.name || 'User',
        email: userData.email || email,
        role: role,
        ...userData
      }));

      console.log('Stored user:', JSON.parse(localStorage.getItem('user')));

      // Redirect based on role
      switch(role.toUpperCase()) {
        case 'ADMIN':
          navigate('/admin-dashboard');
          break;
        case 'STAFF':
          navigate('/staff-dashboard');
          break;
        case 'RECEPTION':
          navigate('/reception-dashboard');
          break;
        default:
          navigate('/admin-dashboard');
      }

    } catch (err) {
      console.error('Login error:', err.response || err);
      
      // Handle specific error cases
      if (err.response) {
        const errorMessage = err.response.data?.error || 
                            err.response.data?.message || 
                            'Invalid email or password';
        
        if (errorMessage.includes('deactivated') || 
            errorMessage.includes('inactive') || 
            errorMessage.includes('disabled')) {
          setError('Account is deactivated. Contact administrator.');
        } 
        else if (err.response.status === 401) {
          setError('Invalid email or password');
        } 
        else {
          setError(errorMessage);
        }
      } 
      else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if backend is running.');
      } 
      else if (err.message.includes('No user data')) {
        setError('Invalid response from server');
      }
      else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get role color based on email
  const getRoleColor = () => {
    const emailLower = email.toLowerCase();
    if (emailLower.includes('admin')) return '#db3232'; // Red
    if (emailLower.includes('staff')) return '#70a6ec'; // Blue
    if (emailLower.includes('reception')) return '#43c03e'; // Green
    return '#800c0c'; // Default red
  };

  // Render password dots
  const renderPasswordDots = () => {
    return '•'.repeat(password.length);
  };

  return (
    <div className="login-container">
      {/* Background pattern */}
      <div className="background-pattern">
        <div className="pattern-circle circle-1"></div>
        <div className="pattern-circle circle-2"></div>
        <div className="pattern-circle circle-3"></div>
      </div>

      <div className="login-card">
        {/* Decorative borders */}
        <div className="decorative-top"></div>
        <div className="decorative-bottom"></div>
        
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Building size={36} />
            </div>
            <div>
              <h1>SALON BLOSSOMS</h1>
              <p className="subtitle">Professional Management System</p>
            </div>
          </div>
        </div>
        
        <div className="login-body">
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="input-label">
                <Mail size={18} className="label-icon" />
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  className="input-field"
                />
                <div className="input-border"></div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="input-label">
                <Lock size={18} className="label-icon" />
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="input-field"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <div className="input-border"></div>
              </div>
              
              {/* Password Dots Display */}
              {password.length > 0 && (
                <div 
                  className="password-dots"
                  style={{ color: getRoleColor() }}
                >
                  {renderPasswordDots()}
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="login-btn" 
              disabled={loading}
              style={{
                background: loading ? '#444' : getRoleColor()
              }}
            >
              {loading ? (
                <div className="btn-loading">
                  <div className="spinner"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <div className="role-badges">
              <span className="role-badge admin">
                <Shield size={12} /> ADMIN
              </span>
              <span className="role-badge staff">
                <Users size={12} /> STAFF
              </span>
              <span className="role-badge reception">
                <User size={12} /> RECEPTION
              </span>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;