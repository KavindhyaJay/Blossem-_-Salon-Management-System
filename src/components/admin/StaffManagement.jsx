// src/components/admin/StaffManagement.jsx - COMPLETE VERSION
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Edit, 
  Trash2, 
  UserPlus, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  User,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Bug,
  Key,
  Database
} from 'lucide-react';
import axios from 'axios';
import './StaffManagement.css';

const StaffManagement = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [saving, setSaving] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    phone: '',
    status: 'PENDING_ACTIVATION'
  });

  const API_BASE_URL = 'http://localhost:8081';

  // Add debug log
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  // Fetch staff from backend
  const fetchStaff = async () => {
    setLoading(true);
    setError('');
    addDebugLog('🔍 Starting to fetch staff data...');
    
    try {
      // 1. Get token and clean it
      let token = localStorage.getItem('token');
      addDebugLog(`📋 Token exists: ${!!token}`);
      
      if (!token) {
        throw new Error('No authentication token found in localStorage');
      }
      
      // Clean token (remove quotes if any)
      let cleanToken = token;
      if (token.startsWith('"') && token.endsWith('"')) {
        cleanToken = token.substring(1, token.length - 1);
        addDebugLog('🧹 Removed quotes from token');
      }
      
      addDebugLog(`📏 Token length: ${cleanToken.length} characters`);
      addDebugLog(`🔑 Token preview: ${cleanToken.substring(0, 30)}...`);
      
      // 2. Create headers
      const headers = {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      };
      
      addDebugLog(`🌐 Making GET request to: ${API_BASE_URL}/api/staff`);
      addDebugLog(`📨 Headers: ${JSON.stringify(headers)}`);
      
      // 3. Make the request with axios
      const response = await axios.get(`${API_BASE_URL}/api/staff`, {
        headers: headers,
        timeout: 10000,
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accept 4xx errors too
        }
      });
      
      addDebugLog(`📊 Response status: ${response.status}`);
      addDebugLog(`📦 Response headers: ${JSON.stringify(response.headers)}`);
      addDebugLog(`📦 Response data type: ${typeof response.data}`);
      
      // 4. Handle response
      if (response.status === 200) {
        // Success!
        let staffData = response.data;
        
        // Handle different response formats
        if (Array.isArray(staffData)) {
          addDebugLog(`✅ Success! Received ${staffData.length} staff members`);
          setStaffMembers(staffData);
        } else if (staffData && Array.isArray(staffData.data)) {
          // If response is wrapped in { data: [...] }
          addDebugLog(`✅ Success! Received ${staffData.data.length} staff members (wrapped)`);
          setStaffMembers(staffData.data);
        } else if (staffData && typeof staffData === 'object') {
          // Try to extract array from object
          const keys = Object.keys(staffData);
          addDebugLog(`⚠️ Response is object with keys: ${keys.join(', ')}`);
          
          // Check if any key contains an array
          for (let key of keys) {
            if (Array.isArray(staffData[key])) {
              addDebugLog(`✅ Found array in key "${key}" with ${staffData[key].length} items`);
              setStaffMembers(staffData[key]);
              break;
            }
          }
        } else {
          addDebugLog(`⚠️ Unexpected response format: ${JSON.stringify(staffData).substring(0, 200)}...`);
          setStaffMembers([]);
        }
      } 
      else if (response.status === 401) {
        const errorMsg = response.data?.error || 'Token invalid or expired';
        addDebugLog(`❌ Unauthorized: ${errorMsg}`);
        throw new Error(`Unauthorized: ${errorMsg}`);
      }
      else if (response.status === 403) {
        const errorMsg = response.data?.error || 'Admin access required';
        addDebugLog(`❌ Forbidden: ${errorMsg}`);
        throw new Error(`Forbidden: ${errorMsg}`);
      }
      else if (response.status === 404) {
        addDebugLog(`❌ Endpoint not found: /api/staff`);
        throw new Error('Endpoint not found: /api/staff');
      }
      else {
        addDebugLog(`❌ Server error ${response.status}: ${JSON.stringify(response.data)}`);
        throw new Error(`Server error ${response.status}: ${JSON.stringify(response.data)}`);
      }
      
    } catch (err) {
      console.error('❌ Detailed error in fetchStaff:', err);
      addDebugLog(`❌ Error: ${err.message}`);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to load staff members';
      
      if (err.response) {
        // Server responded with error
        addDebugLog(`📊 Server response status: ${err.response.status}`);
        addDebugLog(`📊 Server response data: ${JSON.stringify(err.response.data)}`);
        
        if (err.response.data?.error) {
          errorMessage = `Server: ${err.response.data.error}`;
        } else if (err.response.data?.message) {
          errorMessage = `Server: ${err.response.data.message}`;
        } else {
          errorMessage = `Server error ${err.response.status}: ${JSON.stringify(err.response.data)}`;
        }
      } 
      else if (err.request) {
        // Request made but no response
        addDebugLog(`📡 No response received from server`);
        errorMessage = 'No response from server. Check if backend is running on http://localhost:8081';
      } 
      else if (err.message.includes('Network Error')) {
        addDebugLog(`🌐 Network error detected`);
        errorMessage = 'Network error. Check CORS or server connectivity';
      }
      else if (err.message.includes('timeout')) {
        addDebugLog(`⏰ Request timeout`);
        errorMessage = 'Request timeout. Server might be busy or not responding';
      }
      else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // If unauthorized, clear storage and redirect
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('token') || errorMessage.includes('401')) {
        addDebugLog(`🔒 Token invalid, clearing localStorage`);
        localStorage.clear();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      
      // Fallback to empty array
      setStaffMembers([]);
      
    } finally {
      setLoading(false);
      addDebugLog('🏁 Finished fetching staff data');
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.specialization) {
      setError('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/staff`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        // Refresh staff list
        await fetchStaff();
        // Reset form
        setFormData({
          name: '',
          email: '',
          specialization: '',
          phone: '',
          status: 'PENDING_ACTIVATION'
        });
        setShowAddForm(false);
        alert('✅ Staff member added successfully! An activation email will be sent to them.');
      }
    } catch (err) {
      console.error('Error adding staff:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add staff member. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      specialization: staff.specialization || '',
      phone: staff.phone || '',
      status: staff.status || 'ACTIVE'
    });
    setShowEditForm(true);
    setError('');
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    
    if (!editingStaff) return;
    
    if (!formData.name || !formData.email || !formData.specialization) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/staff/${editingStaff._id || editingStaff.id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        // Refresh staff list
        await fetchStaff();
        setShowEditForm(false);
        setEditingStaff(null);
        alert('✅ Staff member updated successfully!');
      }
    } catch (err) {
      console.error('Error updating staff:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update staff member. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this staff member?\n\nThis action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/staff/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Refresh staff list
      await fetchStaff();
      alert('🗑️ Staff member deleted successfully!');
    } catch (err) {
      console.error('Error deleting staff:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete staff member. Please try again.';
      alert(`❌ ${errorMessage}`);
    }
  };

  // Debug functions
  const debugToken = async () => {
    addDebugLog('=== TOKEN DEBUG START ===');
    
    const token = localStorage.getItem('token');
    addDebugLog(`1. Token from localStorage: ${token}`);
    
    if (!token) {
      addDebugLog('❌ No token found in localStorage');
      return;
    }
    
    // Clean token
    let cleanToken = token;
    if (token.startsWith('"') && token.endsWith('"')) {
      cleanToken = token.substring(1, token.length - 1);
      addDebugLog('🧹 Removed quotes from token');
    }
    
    addDebugLog(`2. Clean token (first 50 chars): ${cleanToken.substring(0, 50)}...`);
    addDebugLog(`3. Token length: ${cleanToken.length} characters`);
    
    // Try to decode the token (your custom JWT)
    try {
      const parts = cleanToken.split('.');
      addDebugLog(`4. Token has ${parts.length} parts`);
      
      if (parts.length >= 2) {
        // Decode payload (base64)
        const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        addDebugLog(`5. Token payload: ${payload}`);
        
        try {
          const payloadObj = JSON.parse(payload);
          addDebugLog(`6. Parsed payload:`, 'success');
          console.log('Parsed token payload:', payloadObj);
          
          // Check expiration
          if (payloadObj.exp) {
            const expDate = new Date(payloadObj.exp * 1000);
            const now = new Date();
            const isExpired = expDate < now;
            addDebugLog(`7. Token expires: ${expDate.toLocaleString()} (${isExpired ? 'EXPIRED' : 'VALID'})`);
          }
        } catch (e) {
          addDebugLog(`6. Cannot parse payload as JSON: ${e.message}`);
        }
      }
    } catch (e) {
      addDebugLog(`5. Cannot decode token: ${e.message}`);
    }
    
    addDebugLog('=== TOKEN DEBUG END ===');
  };

  const testAPIWithoutToken = async () => {
    addDebugLog('=== API TEST WITHOUT TOKEN ===');
    
    try {
      addDebugLog(`Testing: ${API_BASE_URL}/api/staff (without token)`);
      const response = await fetch(`${API_BASE_URL}/api/staff`);
      addDebugLog(`Response status: ${response.status}`);
      addDebugLog(`Response status text: ${response.statusText}`);
      
      const text = await response.text();
      addDebugLog(`Response body: ${text.substring(0, 200)}...`);
    } catch (e) {
      addDebugLog(`Error: ${e.message}`);
    }
  };

  const testPublicEndpoint = async () => {
    addDebugLog('=== PUBLIC ENDPOINT TEST ===');
    
    try {
      addDebugLog(`Testing: ${API_BASE_URL}/api/public/gallery`);
      const response = await fetch(`${API_BASE_URL}/api/public/gallery`);
      addDebugLog(`Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addDebugLog(`✅ Public endpoint works! Data: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        addDebugLog(`❌ Public endpoint failed: ${response.status}`);
      }
    } catch (e) {
      addDebugLog(`Error: ${e.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('active')) {
      return (
        <span className="status-badge active">
          <CheckCircle size={14} />
          Active
        </span>
      );
    } else if (statusLower.includes('pending')) {
      return (
        <span className="status-badge pending">
          <Clock size={14} />
          Pending
        </span>
      );
    } else if (statusLower.includes('inactive')) {
      return (
        <span className="status-badge inactive">
          <XCircle size={14} />
          Inactive
        </span>
      );
    }
    return <span className="status-badge unknown">{status || 'Unknown'}</span>;
  };

  // Filter staff based on search and status filter
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = 
      staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      staff.status?.toLowerCase().includes(filterStatus.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="staff-management">
      <div className="section-header">
        <div className="header-title">
          <Users size={28} className="header-icon" />
          <div>
            <h1>Staff Management</h1>
            <p className="subtitle">Manage salon staff members and their details</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-add"
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                specialization: '',
                phone: '',
                status: 'PENDING_ACTIVATION'
              });
              setShowAddForm(true);
              setError('');
            }}
            disabled={loading || saving}
          >
            <UserPlus size={18} />
            <span>Add New Staff</span>
          </button>
          
          <button 
            className="btn-refresh"
            onClick={fetchStaff}
            disabled={loading || saving}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          <button 
            className="btn-debug"
            onClick={() => setDebugMode(!debugMode)}
          >
            <Bug size={18} />
            <span>{debugMode ? 'Hide Debug' : 'Debug'}</span>
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      {debugMode && (
        <div className="debug-panel">
          <div className="debug-header">
            <h3><Bug size={20} /> Debug Tools</h3>
            <button onClick={() => setDebugLogs([])}>Clear Logs</button>
          </div>
          
          <div className="debug-actions">
            <button onClick={debugToken} className="debug-btn">
              <Key size={16} /> Debug Token
            </button>
            <button onClick={testAPIWithoutToken} className="debug-btn">
              Test API Without Token
            </button>
            <button onClick={testPublicEndpoint} className="debug-btn">
              Test Public Endpoint
            </button>
            <button onClick={fetchStaff} className="debug-btn">
              <Database size={16} /> Force Reload Staff
            </button>
          </div>
          
          <div className="debug-logs">
            <h4>Debug Logs:</h4>
            <div className="logs-container">
              {debugLogs.length === 0 ? (
                <p className="no-logs">No logs yet. Click debug buttons above.</p>
              ) : (
                debugLogs.slice().reverse().map((log, index) => (
                  <div key={index} className={`log-entry ${log.type}`}>
                    <span className="log-time">[{log.timestamp}]</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {/* Controls */}
      <div className="controls-container">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            disabled={loading}
          />
        </div>
        
        <div className="filter-container">
          <Filter size={18} className="filter-icon" />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
            disabled={loading}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <button 
          className="btn-export"
          onClick={() => {
            // Export functionality
            const csvData = filteredStaff.map(staff => ({
              ID: staff._id?.substring(0, 8) || 'N/A',
              Name: staff.name,
              Email: staff.email,
              Specialization: staff.specialization,
              Status: staff.status,
              Phone: staff.phone || 'N/A'
            }));
            console.log('Export data:', csvData);
            alert('CSV export would download ' + filteredStaff.length + ' staff members');
          }}
          disabled={loading || saving}
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Staff</h3>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-value">{staffMembers.length}</div>
          <div className="stat-label">Members</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Active</h3>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-value">
            {staffMembers.filter(s => s.status?.toLowerCase().includes('active')).length}
          </div>
          <div className="stat-label">Working</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Pending</h3>
            <div className="stat-icon">⏳</div>
          </div>
          <div className="stat-value">
            {staffMembers.filter(s => s.status?.toLowerCase().includes('pending')).length}
          </div>
          <div className="stat-label">Awaiting</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Specializations</h3>
            <div className="stat-icon">🎯</div>
          </div>
          <div className="stat-value">
            {[...new Set(staffMembers.map(s => s.specialization))].length}
          </div>
          <div className="stat-label">Unique</div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Staff Members ({filteredStaff.length})</h3>
          <div className="table-info">
            Showing {filteredStaff.length} of {staffMembers.length} staff members
            {loading && <span className="loading-indicator"> • Loading...</span>}
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th className="id-column">ID</th>
                <th className="name-column">Staff Member</th>
                <th className="email-column">Email</th>
                <th className="specialization-column">Specialization</th>
                <th className="phone-column">Phone</th>
                <th className="status-column">Status</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && staffMembers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="loading-cell">
                    <div className="loading-indicator">
                      <div className="spinner"></div>
                      Loading staff data from database...
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    <div className="empty-state">
                      <User size={48} className="empty-icon" />
                      <h4>No staff members found</h4>
                      <p>
                        {searchQuery || filterStatus !== 'all'
                          ? "Try changing your search criteria or filters"
                          : "Click 'Add New Staff' to add your first staff member"
                        }
                      </p>
                      {!searchQuery && filterStatus === 'all' && staffMembers.length === 0 && (
                        <button 
                          className="btn-add"
                          onClick={() => setShowAddForm(true)}
                          style={{ marginTop: '15px' }}
                        >
                          <UserPlus size={16} />
                          Add Your First Staff Member
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff._id || staff.id} className="table-row">
                    <td className="id-column">
                      <code>#{staff._id?.substring(0, 8) || staff.id?.substring(0, 8) || 'N/A'}</code>
                    </td>
                    <td className="name-column">
                      <div className="staff-info">
                        <div className="staff-avatar">
                          {staff.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div className="staff-details">
                          <div className="staff-name">{staff.name || 'Unknown'}</div>
                          <div className="staff-id">
                            ID: {staff._id?.substring(0, 8) || staff.id?.substring(0, 8) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="email-column">
                      <div className="email-cell">
                        <Mail size={16} />
                        <span>{staff.email || 'No email'}</span>
                      </div>
                    </td>
                    <td className="specialization-column">
                      <span className="specialization-tag">
                        {staff.specialization || 'Not specified'}
                      </span>
                    </td>
                    <td className="phone-column">
                      <div className="phone-cell">
                        <Phone size={16} />
                        <span>{staff.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="status-column">
                      {getStatusBadge(staff.status)}
                    </td>
                    <td className="actions-column">
                      <div className="action-buttons">
                        <button 
                          className="btn-edit"
                          title="Edit staff member"
                          onClick={() => handleEditStaff(staff)}
                          disabled={saving}
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button 
                          className="btn-delete"
                          title="Delete staff member"
                          onClick={() => handleDeleteStaff(staff._id || staff.id)}
                          disabled={saving}
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Form Modal */}
      {(showAddForm || showEditForm) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{showEditForm ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setEditingStaff(null);
                  setError('');
                }}
                disabled={saving}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={showEditForm ? handleUpdateStaff : handleAddStaff} className="staff-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <span className="required">*</span> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    disabled={saving}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <span className="required">*</span> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                    disabled={saving || showEditForm}
                    className="form-input"
                  />
                  {showEditForm && (
                    <small className="form-note">Email cannot be changed</small>
                  )}
                </div>
                
                <div className="form-group">
                  <label>
                    <span className="required">*</span> Specialization
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                    className="form-select"
                  >
                    <option value="">Select specialization</option>
                    <option value="Hair Stylist">Hair Stylist</option>
                    <option value="Color Specialist">Color Specialist</option>
                    <option value="Nail Technician">Nail Technician</option>
                    <option value="Makeup Artist">Makeup Artist</option>
                    <option value="Skincare Specialist">Skincare Specialist</option>
                    <option value="Massage Therapist">Massage Therapist</option>
                    <option value="Barber">Barber</option>
                    <option value="Esthetician">Esthetician</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number (optional)"
                    disabled={saving}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="form-select"
                  >
                    <option value="PENDING_ACTIVATION">Pending Activation</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  {!showEditForm && (
                    <small className="form-note">
                      Pending Activation will require staff to activate via email
                    </small>
                  )}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setEditingStaff(null);
                    setError('');
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="spinner-small"></div>
                      Saving...
                    </>
                  ) : (
                    showEditForm ? 'Update Staff' : 'Add Staff'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;