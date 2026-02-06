// src/components/admin/StaffManagement.jsx - UPDATED VERSION WITH MULTI-SELECT
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
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import './StaffManagement.css';

const StaffManagement = () => {
  // ========== STATE VARIABLES ==========
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Updated: specializations is now an array
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specializations: [], // Changed from specialization to specializations (array)
    phone: '',
    status: 'PENDING_ACTIVATION'
  });

  // Available specializations for multi-select
  const availableSpecializations = [
    'Hair Stylist',
    'Color Specialist',
    'Nail Technician',
    'Makeup Artist',
    'Skincare Specialist',
    'Massage Therapist',
    'Barber',
    'Esthetician',
    'Hair Extensions',
    'Bridal Stylist',
    'Men\'s Grooming',
    'Waxing Specialist',
    'Lash Technician',
    'Pedicurist',
    'Manicurist'
  ];

  const API_BASE_URL = 'http://localhost:8081';

  // ========== FUNCTIONS ==========
  // Clean fetch function
  const fetchStaff = async () => {
    setLoading(true);
    setError('');
    
    try {
      let token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Clean token
      let cleanToken = token;
      if (token.startsWith('"') && token.endsWith('"')) {
        cleanToken = token.substring(1, token.length - 1);
      }
      
      const headers = {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.get(`${API_BASE_URL}/api/staff`, {
        headers: headers,
        timeout: 10000,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });
      
      if (response.status === 200) {
        let staffData = response.data;
        
        if (Array.isArray(staffData)) {
          setStaffMembers(staffData);
        } else if (staffData && Array.isArray(staffData.data)) {
          setStaffMembers(staffData.data);
        } else if (staffData && typeof staffData === 'object') {
          const keys = Object.keys(staffData);
          for (let key of keys) {
            if (Array.isArray(staffData[key])) {
              setStaffMembers(staffData[key]);
              break;
            }
          }
        } else {
          setStaffMembers([]);
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
        throw new Error('Endpoint not found: /api/staff');
      }
      else {
        throw new Error(`Server error ${response.status}`);
      }
      
    } catch (err) {
      console.error('Error fetching staff:', err);
      
      let errorMessage = 'Failed to load staff members';
      
      if (err.response) {
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } 
      else if (err.request) {
        errorMessage = 'No response from server. Check if backend is running.';
      } 
      else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. Check server connectivity.';
      }
      else if (err.message.includes('timeout')) {
        errorMessage = 'Request timeout. Server might be busy.';
      }
      else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('token') || errorMessage.includes('401')) {
        localStorage.clear();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      
      setStaffMembers([]);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Handle input change for regular fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle specialization toggle (for checkbox/multi-select)
  const handleSpecializationToggle = (specialization) => {
    setFormData(prev => {
      const currentSpecs = [...prev.specializations];
      if (currentSpecs.includes(specialization)) {
        // Remove if already selected
        return {
          ...prev,
          specializations: currentSpecs.filter(s => s !== specialization)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          specializations: [...currentSpecs, specialization]
        };
      }
    });
  };

  // Handle multi-select dropdown change
  const handleMultiSelectChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setFormData(prev => ({
      ...prev,
      specializations: selectedValues
    }));
  };

  // Handle adding staff - convert array to comma-separated string
  const handleAddStaff = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || formData.specializations.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Convert array to comma-separated string for backend
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      specialization: formData.specializations.join(', '), // Convert array to string
      phone: formData.phone,
      status: formData.status,
      role: 'STAFF' // Added role as per backend requirement
    };

    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/staff`, dataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        await fetchStaff();
        setFormData({
          name: '',
          email: '',
          specializations: [],
          phone: '',
          status: 'PENDING_ACTIVATION'
        });
        setShowAddForm(false);
        alert('✅ Staff member added successfully!');
      }
    } catch (err) {
      console.error('Error adding staff:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add staff member. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Handle editing staff - parse comma-separated string to array
  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    
    // Parse comma-separated string back to array
    const specializations = staff.specialization 
      ? staff.specialization.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];
    
    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      specializations: specializations,
      phone: staff.phone || '',
      status: staff.status || 'ACTIVE'
    });
    setShowEditForm(true);
    setError('');
  };

  // Handle updating staff - convert array to comma-separated string
  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    
    if (!editingStaff) return;
    
    if (!formData.name || !formData.email || formData.specializations.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    // Convert array to comma-separated string for backend
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      specialization: formData.specializations.join(', '), // Convert array to string
      phone: formData.phone,
      status: formData.status,
      role: 'STAFF' // Added role as per backend requirement
    };

    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/staff/${editingStaff._id || editingStaff.id}`,
        dataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
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
      await fetchStaff();
      alert('🗑️ Staff member deleted successfully!');
    } catch (err) {
      console.error('Error deleting staff:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete staff member. Please try again.';
      alert(`❌ ${errorMessage}`);
    }
  };

  // Simple status badge without arrows
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('active')) {
      return (
        <span className="staff-status-badge active">
          <CheckCircle size={14} />
          Active
        </span>
      );
    } else if (statusLower.includes('pending')) {
      return (
        <span className="staff-status-badge pending">
          <Clock size={14} />
          Pending
        </span>
      );
    } else if (statusLower.includes('inactive')) {
      return (
        <span className="staff-status-badge inactive">
          <XCircle size={14} />
          Inactive
        </span>
      );
    }
    return (
      <span className="staff-status-badge inactive">
        <XCircle size={14} />
        {status || 'Unknown'}
      </span>
    );
  };

  // Filter staff
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

  // ========== RENDER ==========
  return (
    <div className="staff-management-container">
      <div className="staff-section-header">
        <div className="staff-header-title">
          <Users size={28} className="staff-header-icon" />
          <div>
            <h1>Staff Management</h1>
            <p className="staff-subtitle">Manage salon staff members and their details</p>
          </div>
        </div>
        
        <div className="staff-header-actions">
          <button 
            className="staff-btn-add"
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                specializations: [],
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
            className="staff-btn-refresh"
            onClick={fetchStaff}
            disabled={loading || saving}
          >
            <RefreshCw size={18} className={loading ? 'staff-spinning' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="staff-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="staff-error-close">×</button>
        </div>
      )}

      {/* Controls */}
      <div className="staff-controls-container">
        <div className="staff-search-container">
          <Search size={20} className="staff-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="staff-search-input"
            disabled={loading}
          />
        </div>
        
        <div className="staff-filter-container">
          <Filter size={18} className="staff-filter-icon" />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="staff-filter-select"
            disabled={loading}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <button 
          className="staff-btn-export"
          onClick={() => {
            const csvData = filteredStaff.map(staff => ({
              ID: staff._id?.substring(0, 8) || 'N/A',
              Name: staff.name,
              Email: staff.email,
              Specialization: staff.specialization,
              Status: staff.status,
              Phone: staff.phone || 'N/A'
            }));
            
            const headers = Object.keys(csvData[0] || {}).join(',');
            const rows = csvData.map(row => Object.values(row).join(','));
            const csvContent = [headers, ...rows].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'staff_members.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }}
          disabled={loading || saving || filteredStaff.length === 0}
        >
          <Download size={18} />
          <span>Export CSV ({filteredStaff.length})</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="staff-stats-grid">
        <div className="staff-stat-card">
          <div className="staff-stat-header">
            <h3>Total Staff</h3>
            <div className="staff-stat-icon">👥</div>
          </div>
          <div className="staff-stat-value">{staffMembers.length}</div>
          <div className="staff-stat-label">Members</div>
        </div>
        
        <div className="staff-stat-card">
          <div className="staff-stat-header">
            <h3>Active</h3>
            <div className="staff-stat-icon">✅</div>
          </div>
          <div className="staff-stat-value">
            {staffMembers.filter(s => s.status?.toLowerCase().includes('active')).length}
          </div>
          <div className="staff-stat-label">Working</div>
        </div>
        
        <div className="staff-stat-card">
          <div className="staff-stat-header">
            <h3>Pending</h3>
            <div className="staff-stat-icon">⏳</div>
          </div>
          <div className="staff-stat-value">
            {staffMembers.filter(s => s.status?.toLowerCase().includes('pending')).length}
          </div>
          <div className="staff-stat-label">Awaiting</div>
        </div>
        
        <div className="staff-stat-card">
          <div className="staff-stat-header">
            <h3>Specializations</h3>
            <div className="staff-stat-icon">🎯</div>
          </div>
          <div className="staff-stat-value">
            {[...new Set(staffMembers.map(s => s.specialization))].length}
          </div>
          <div className="staff-stat-label">Unique</div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="staff-table-container">
        <div className="staff-table-header">
          <h3>Staff Members ({filteredStaff.length})</h3>
          <div className="staff-table-info">
            Showing {filteredStaff.length} of {staffMembers.length} staff members
            {loading && <span className="staff-loading-indicator"> • Loading...</span>}
          </div>
        </div>
        
        <div className="staff-table-wrapper">
          <table className="staff-management-table">
            <thead>
              <tr>
                <th className="staff-id-column">ID</th>
                <th className="staff-name-column">Staff Member</th>
                <th className="staff-email-column">Email</th>
                <th className="staff-specialization-column">Specialization</th>
                <th className="staff-phone-column">Phone</th>
                <th className="staff-status-column">Status</th>
                <th className="staff-actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && staffMembers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="staff-loading-cell">
                    <div className="staff-loading-indicator">
                      <div className="staff-spinner"></div>
                      Loading staff data from database...
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="staff-empty-cell">
                    <div className="staff-empty-state">
                      <User size={48} className="staff-empty-icon" />
                      <h4>No staff members found</h4>
                      <p>
                        {searchQuery || filterStatus !== 'all'
                          ? "Try changing your search criteria or filters"
                          : "Click 'Add New Staff' to add your first staff member"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff._id || staff.id} className="staff-table-row">
                    <td className="staff-id-column">
                      <code>#{staff._id?.substring(0, 8) || staff.id?.substring(0, 8) || 'N/A'}</code>
                    </td>
                    <td className="staff-name-column">
                      <div className="staff-member-info">
                        <div className="staff-member-avatar">
                          {staff.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div className="staff-member-details">
                          <div className="staff-member-name">{staff.name || 'Unknown'}</div>
                          <div className="staff-member-id">
                            ID: {staff._id?.substring(0, 8) || staff.id?.substring(0, 8) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="staff-email-column">
                      <div className="staff-email-cell">
                        <Mail size={16} />
                        <span>{staff.email || 'No email'}</span>
                      </div>
                    </td>
                    <td className="staff-specialization-column">
                      <div className="staff-specialization-tags">
                        {staff.specialization ? 
                          staff.specialization.split(',')
                            .map(spec => spec.trim())
                            .filter(spec => spec.length > 0)
                            .map((spec, index) => (
                              <span key={index} className="staff-specialization-badge">
                                {spec}
                              </span>
                            ))
                          : 'Not specified'
                        }
                      </div>
                    </td>
                    <td className="staff-phone-column">
                      <div className="staff-phone-cell">
                        <Phone size={16} />
                        <span>{staff.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="staff-status-column">
                      {getStatusBadge(staff.status)}
                    </td>
                    <td className="staff-actions-column">
                      <div className="staff-action-buttons">
                        <button 
                          className="staff-btn-edit"
                          title="Edit staff member"
                          onClick={() => handleEditStaff(staff)}
                          disabled={saving}
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button 
                          className="staff-btn-delete"
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

      {/* Add/Edit Form Modal with Multi-Select */}
      {(showAddForm || showEditForm) && (
        <div className="staff-modal-overlay">
          <div className="staff-modal-content">
            <div className="staff-modal-header">
              <h2>{showEditForm ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
              <button 
                className="staff-modal-close"
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
            
            <form onSubmit={showEditForm ? handleUpdateStaff : handleAddStaff} className="staff-staff-form">
              <div className="staff-form-grid">
                <div className="staff-form-group">
                  <label>
                    <span className="staff-required">*</span> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    disabled={saving}
                    className="staff-form-input"
                  />
                </div>
                
                <div className="staff-form-group">
                  <label>
                    <span className="staff-required">*</span> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                    disabled={saving || showEditForm}
                    className="staff-form-input"
                  />
                  {showEditForm && (
                    <small className="staff-form-note">Email cannot be changed</small>
                  )}
                </div>
                
                {/* Specializations Multi-Select */}
                <div className="staff-form-group staff-multiselect-group">
                  <label>
                    <span className="staff-required">*</span> Specializations
                    {formData.specializations.length > 0 && (
                      <span className="staff-selected-count">
                        ({formData.specializations.length} selected)
                      </span>
                    )}
                  </label>
                  
                  {/* Option 1: Multi-select dropdown (recommended) */}
                  <select
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleMultiSelectChange}
                    required
                    disabled={saving}
                    className="staff-form-multiselect"
                    multiple
                    size="6"
                  >
                    <option value="" disabled>Select specializations (hold Ctrl/Cmd to select multiple)</option>
                    {availableSpecializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  <small className="staff-form-note">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple items
                  </small>
                  
                  {/* Selected specializations display */}
                  {formData.specializations.length > 0 && (
                    <div className="staff-selected-specializations">
                      <div className="staff-selected-header">
                        <strong>Selected Specializations:</strong>
                        <span className="staff-selected-count-badge">
                          {formData.specializations.length} selected
                        </span>
                      </div>
                      <div className="staff-selected-chips">
                        {formData.specializations.map(spec => (
                          <span key={spec} className="staff-selected-chip">
                            {spec}
                            <button
                              type="button"
                              className="staff-chip-remove"
                              onClick={() => handleSpecializationToggle(spec)}
                              title="Remove"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Option 2: Checkbox alternative (commented out) */}
                  {/*
                  <div className="staff-checkbox-container">
                    {availableSpecializations.map((spec) => (
                      <div key={spec} className="staff-checkbox-item">
                        <input
                          type="checkbox"
                          id={`spec-${spec}`}
                          checked={formData.specializations.includes(spec)}
                          onChange={() => handleSpecializationToggle(spec)}
                          disabled={saving}
                        />
                        <label htmlFor={`spec-${spec}`}>{spec}</label>
                      </div>
                    ))}
                  </div>
                  */}
                </div>
                
                <div className="staff-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number (optional)"
                    disabled={saving}
                    className="staff-form-input"
                  />
                </div>
                
                <div className="staff-form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="staff-form-select"
                  >
                    <option value="PENDING_ACTIVATION">Pending Activation</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  {!showEditForm && (
                    <small className="staff-form-note">
                      Pending Activation will require staff to activate via email
                    </small>
                  )}
                </div>
              </div>
              
              <div className="staff-form-actions">
                <button 
                  type="button" 
                  className="staff-btn-cancel"
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
                  className="staff-btn-save"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="staff-spinner-small"></div>
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