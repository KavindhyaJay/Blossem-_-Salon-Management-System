// src/components/admin/ReceptionManagement.jsx - GREEN AND BLACK VERSION
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
  Calendar,
  Shield
} from 'lucide-react';
import axios from 'axios';
import './ReceptionManagement.css';

const ReceptionManagement = () => {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterShift, setFilterShift] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingReceptionist, setEditingReceptionist] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shift: 'MORNING',
    status: 'PENDING'
  });

  const API_BASE_URL = 'http://localhost:8081';

  // Fetch receptionists from backend
  const fetchReceptionists = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get token from localStorage
      let token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found in localStorage');
      }
      
      // Clean token (remove quotes if any)
      let cleanToken = token;
      if (token.startsWith('"') && token.endsWith('"')) {
        cleanToken = token.substring(1, token.length - 1);
      }
      
      // Create headers
      const headers = {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      };
      
      // Make the request with axios
      const response = await axios.get(`${API_BASE_URL}/api/reception`, {
        headers: headers,
        timeout: 10000,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });
      
      // Handle response
      if (response.status === 200) {
        let receptionData = response.data;
        
        // Handle different response formats
        if (Array.isArray(receptionData)) {
          setReceptionists(receptionData);
        } else if (receptionData && Array.isArray(receptionData.data)) {
          setReceptionists(receptionData.data);
        } else if (receptionData && typeof receptionData === 'object') {
          // Try to extract array from object
          const keys = Object.keys(receptionData);
          for (let key of keys) {
            if (Array.isArray(receptionData[key])) {
              setReceptionists(receptionData[key]);
              break;
            }
          }
        } else {
          setReceptionists([]);
        }
      } 
      else if (response.status === 401) {
        const errorMsg = response.data?.error || 'Token invalid or expired';
        throw new Error(`Unauthorized: ${errorMsg}`);
      }
      else if (response.status === 403) {
        const errorMsg = response.data?.error || 'Admin access required';
        throw new Error(`Forbidden: ${errorMsg}`);
      }
      else if (response.status === 404) {
        throw new Error('Endpoint not found: /api/reception');
      }
      else {
        throw new Error(`Server error ${response.status}`);
      }
      
    } catch (err) {
      console.error('Error in fetchReceptionists:', err);
      
      let errorMessage = 'Failed to load receptionists';
      
      if (err.response) {
        if (err.response.data?.error) {
          errorMessage = `Server: ${err.response.data.error}`;
        } else {
          errorMessage = `Server error ${err.response.status}`;
        }
      } 
      else if (err.request) {
        errorMessage = 'No response from server. Check if backend is running on http://localhost:8081';
      } 
      else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. Check CORS or server connectivity';
      }
      else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // If unauthorized, clear storage and redirect
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('token') || errorMessage.includes('401')) {
        localStorage.clear();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      
      // Fallback to empty array
      setReceptionists([]);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddReceptionist = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
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
      const response = await axios.post(`${API_BASE_URL}/api/reception`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        // Refresh receptionists list
        await fetchReceptionists();
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          shift: 'MORNING',
          status: 'PENDING'
        });
        setShowAddForm(false);
        alert('✅ Receptionist added successfully! An activation email will be sent to them.');
      }
    } catch (err) {
      console.error('Error adding receptionist:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to add receptionist. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEditReceptionist = (receptionist) => {
    setEditingReceptionist(receptionist);
    setFormData({
      name: receptionist.name || '',
      email: receptionist.email || '',
      phone: receptionist.phone || '',
      shift: receptionist.shift || 'MORNING',
      status: receptionist.status || 'ACTIVE'
    });
    setShowEditForm(true);
    setError('');
  };

  const handleUpdateReceptionist = async (e) => {
    e.preventDefault();
    
    if (!editingReceptionist) return;
    
    if (!formData.name) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/reception/${editingReceptionist._id || editingReceptionist.id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        // Refresh receptionists list
        await fetchReceptionists();
        setShowEditForm(false);
        setEditingReceptionist(null);
        alert('✅ Receptionist updated successfully!');
      }
    } catch (err) {
      console.error('Error updating receptionist:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to update receptionist. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReceptionist = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this receptionist?\n\nThis action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/reception/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Refresh receptionists list
      await fetchReceptionists();
      alert('🗑️ Receptionist deleted successfully!');
    } catch (err) {
      console.error('Error deleting receptionist:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to delete receptionist. Please try again.';
      alert(`❌ ${errorMessage}`);
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

  const getShiftBadge = (shift) => {
    const shiftUpper = shift?.toUpperCase() || '';
    
    switch(shiftUpper) {
      case 'MORNING':
        return (
          <span className="shift-badge morning">
            <span className="shift-icon">☀️</span>
            Morning
          </span>
        );
      case 'EVENING':
        return (
          <span className="shift-badge evening">
            <span className="shift-icon">🌙</span>
            Evening
          </span>
        );
      case 'FULL_DAY':
      case 'FULLDAY':
        return (
          <span className="shift-badge full-day">
            <span className="shift-icon">⏰</span>
            Full Day
          </span>
        );
      default:
        return <span className="shift-badge unknown">{shift || 'Not Set'}</span>;
    }
  };

  // Filter receptionists based on search and filters
  const filteredReceptionists = receptionists.filter(receptionist => {
    const matchesSearch = 
      receptionist.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receptionist.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receptionist.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      receptionist.status?.toLowerCase().includes(filterStatus.toLowerCase());
    
    const matchesShift = 
      filterShift === 'all' || 
      receptionist.shift?.toLowerCase() === filterShift.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesShift;
  });

  // Stats calculation
  const totalReceptionists = receptionists.length;
  const activeReceptionists = receptionists.filter(r => r.status?.toLowerCase().includes('active')).length;
  const pendingReceptionists = receptionists.filter(r => r.status?.toLowerCase().includes('pending')).length;
  const morningShift = receptionists.filter(r => r.shift?.toLowerCase().includes('morning')).length;
  const eveningShift = receptionists.filter(r => r.shift?.toLowerCase().includes('evening')).length;

  return (
    <div className="reception-management">
      <div className="section-header">
        <div className="header-title">
          <Users size={28} className="header-icon" />
          <div>
            <h1>Reception Management</h1>
            <p className="subtitle">Manage reception staff and their schedules</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-add"
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                shift: 'MORNING',
                status: 'PENDING'
              });
              setShowAddForm(true);
              setError('');
            }}
            disabled={loading || saving}
          >
            <UserPlus size={18} />
            <span>Add Receptionist</span>
          </button>
          
          <button 
            className="btn-refresh"
            onClick={fetchReceptionists}
            disabled={loading || saving}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

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
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            disabled={loading}
          />
        </div>
        
        <div className="filters-row">
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
          
          <div className="filter-container">
            <Calendar size={18} className="filter-icon" />
            <select 
              value={filterShift} 
              onChange={(e) => setFilterShift(e.target.value)}
              className="filter-select"
              disabled={loading}
            >
              <option value="all">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="full_day">Full Day</option>
            </select>
          </div>
        </div>
        
        <button 
          className="btn-export"
          onClick={() => {
            const csvData = filteredReceptionists.map(r => ({
              ID: r._id?.substring(0, 8) || 'N/A',
              Name: r.name,
              Email: r.email,
              Phone: r.phone || 'N/A',
              Shift: r.shift,
              Status: r.status
            }));
            console.log('Export data:', csvData);
            alert(`Export ${filteredReceptionists.length} receptionists to CSV`);
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
            <h3>Total Receptionists</h3>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-value">{totalReceptionists}</div>
          <div className="stat-label">Reception Staff</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Active</h3>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-value">{activeReceptionists}</div>
          <div className="stat-label">Working Now</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Pending</h3>
            <div className="stat-icon">⏳</div>
          </div>
          <div className="stat-value">{pendingReceptionists}</div>
          <div className="stat-label">Awaiting Activation</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Morning Shift</h3>
            <div className="stat-icon">☀️</div>
          </div>
          <div className="stat-value">{morningShift}</div>
          <div className="stat-label">Staff on Morning</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Evening Shift</h3>
            <div className="stat-icon">🌙</div>
          </div>
          <div className="stat-value">{eveningShift}</div>
          <div className="stat-label">Staff on Evening</div>
        </div>
      </div>

      {/* Receptionists Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Reception Staff ({filteredReceptionists.length})</h3>
          <div className="table-info">
            Showing {filteredReceptionists.length} of {receptionists.length} receptionists
            {loading && <span className="loading-indicator"> • Loading...</span>}
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="reception-table">
            <thead>
              <tr>
                <th className="id-column">ID</th>
                <th className="name-column">Receptionist</th>
                <th className="contact-column">Contact Info</th>
                <th className="shift-column">Shift</th>
                <th className="status-column">Status</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && receptionists.length === 0 ? (
                <tr>
                  <td colSpan="6" className="loading-cell">
                    <div className="loading-indicator">
                      <div className="spinner"></div>
                      Loading receptionists from database...
                    </div>
                  </td>
                </tr>
              ) : filteredReceptionists.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <div className="empty-state">
                      <User size={48} className="empty-icon" />
                      <h4>No receptionists found</h4>
                      <p>
                        {searchQuery || filterStatus !== 'all' || filterShift !== 'all'
                          ? "Try changing your search criteria or filters"
                          : "Click 'Add Receptionist' to add your first reception staff"
                        }
                      </p>
                      {!searchQuery && filterStatus === 'all' && filterShift === 'all' && receptionists.length === 0 && (
                        <button 
                          className="btn-add"
                          onClick={() => setShowAddForm(true)}
                          style={{ marginTop: '15px' }}
                        >
                          <UserPlus size={16} />
                          Add Your First Receptionist
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReceptionists.map((receptionist) => (
                  <tr key={receptionist._id || receptionist.id} className="table-row">
                    <td className="id-column">
                      <code>#{receptionist._id?.substring(0, 8) || receptionist.id?.substring(0, 8) || 'N/A'}</code>
                    </td>
                    <td className="name-column">
                      <div className="receptionist-info">
                        <div className="receptionist-avatar">
                          {receptionist.name?.charAt(0)?.toUpperCase() || 'R'}
                        </div>
                        <div className="receptionist-details">
                          <div className="receptionist-name">{receptionist.name || 'Unknown'}</div>
                          <div className="receptionist-id">
                            ID: {receptionist._id?.substring(0, 8) || receptionist.id?.substring(0, 8) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="contact-column">
                      <div className="contact-info">
                        <div className="contact-item">
                          <Mail size={14} />
                          <span>{receptionist.email || 'No email'}</span>
                        </div>
                        <div className="contact-item">
                          <Phone size={14} />
                          <span>{receptionist.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="shift-column">
                      {getShiftBadge(receptionist.shift)}
                    </td>
                    <td className="status-column">
                      {getStatusBadge(receptionist.status)}
                    </td>
                    <td className="actions-column">
                      <div className="action-buttons">
                        <button 
                          className="btn-edit"
                          title="Edit receptionist"
                          onClick={() => handleEditReceptionist(receptionist)}
                          disabled={saving}
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button 
                          className="btn-delete"
                          title="Delete receptionist"
                          onClick={() => handleDeleteReceptionist(receptionist._id || receptionist.id)}
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

      {/* Add/Edit Form Modal */}
      {(showAddForm || showEditForm) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                <Shield size={24} />
                {showEditForm ? 'Edit Receptionist' : 'Add New Receptionist'}
              </h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setEditingReceptionist(null);
                  setError('');
                }}
                disabled={saving}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={showEditForm ? handleUpdateReceptionist : handleAddReceptionist} className="reception-form">
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
                  <label>
                    <span className="required">*</span> Shift
                  </label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                    className="form-select"
                  >
                    <option value="">Select shift</option>
                    <option value="MORNING">Morning Shift (8 AM - 4 PM)</option>
                    <option value="EVENING">Evening Shift (4 PM - 12 AM)</option>
                    <option value="FULL_DAY">Full Day (8 AM - 12 AM)</option>
                  </select>
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
                    <option value="PENDING">Pending Activation</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  {!showEditForm && (
                    <small className="form-note">
                      Pending Activation will require receptionist to activate via email
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
                    setEditingReceptionist(null);
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
                    showEditForm ? 'Update Receptionist' : 'Add Receptionist'
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

export default ReceptionManagement;