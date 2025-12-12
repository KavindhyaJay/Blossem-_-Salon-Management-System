// components/dashboard/StaffTable.jsx
import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import '../../styles/StaffTable.css';

const StaffTable = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentStaff, setCurrentStaff] = useState({
    id: null,
    name: '',
    email: '',
    specialization: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load staff from database when component mounts
  useEffect(() => {
    loadStaffFromDatabase();
  }, []);

  // Function to load staff from database
  const loadStaffFromDatabase = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Loading staff from database...');
      
      const data = await staffAPI.getAllStaff();
      console.log('✅ Staff data loaded:', data);
      
      setStaffMembers(data);
    } catch (err) {
      console.error('❌ Error loading staff:', err);
      setError('Failed to load staff members from database');
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Show add form
  const handleAddStaff = () => {
    setIsEditing(false);
    setCurrentStaff({
      id: null,
      name: '',
      email: '',
      specialization: '',
      status: 'Active'
    });
    setShowForm(true);
    setError('');
  };

  // Show edit form
  const handleEdit = (staff) => {
    console.log('📝 Editing staff ID:', staff.id || staff._id);
    console.log('📝 Staff data:', staff);
    
    setIsEditing(true);
    setCurrentStaff({
      id: staff.id || staff._id,
      name: staff.name || '',
      email: staff.email || '',
      specialization: staff.specialization || '',
      status: staff.status || 'Active'
    });
    setShowForm(true);
    setError('');
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setCurrentStaff({
      id: null,
      name: '',
      email: '',
      specialization: '',
      status: 'Active'
    });
    setError('');
    setIsEditing(false);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStaff(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save staff (add or update)
  const handleSaveStaff = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!currentStaff.name.trim() || !currentStaff.email.trim() || !currentStaff.specialization) {
      setError('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentStaff.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      console.log('💾 Saving staff:', currentStaff);
      
      if (isEditing && currentStaff.id) {
        // Update existing staff
        console.log('📤 Updating staff ID:', currentStaff.id);
        await staffAPI.updateStaff(currentStaff.id, currentStaff);
        console.log('✅ Staff updated successfully');
      } else {
        // Add new staff
        console.log('📤 Adding new staff');
        await staffAPI.addStaff(currentStaff);
        console.log('✅ Staff added successfully');
      }
      
      // Refresh staff list
      await loadStaffFromDatabase();
      
      // Close form
      setShowForm(false);
      setCurrentStaff({
        id: null,
        name: '',
        email: '',
        specialization: '',
        status: 'Active'
      });
      setIsEditing(false);
    } catch (err) {
      console.error('❌ Save staff error:', err);
      setError(`Failed to save staff: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete staff - SIMPLE WORKING VERSION
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting staff ID:', id);
      
      // Delete from backend
      await staffAPI.deleteStaff(id);
      console.log('✅ Staff deleted from backend');
      
      // Reload data from database
      await loadStaffFromDatabase();
      
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert('Failed to delete staff from database');
    }
  };

  // Status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return '#4caf50';
      case 'on leave':
        return '#ff9800';
      case 'inactive':
        return '#f44336';
      default:
        return '#666';
    }
  };

  return (
    <div className="staff-section">
      <div className="section-header">
        <h2>Staff Members</h2>
        <div className="header-actions">
          {/* Staff Count Only */}
          {!loading && !error && (
            <div className="staff-count">
              <span className="count-badge">{staffMembers.length}</span>
              <span className="count-text">staff member{staffMembers.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {loading && <span className="loading-indicator">Loading...</span>}
          
          <button 
            className="add-btn" 
            onClick={handleAddStaff}
            disabled={loading || saving}
          >
            + Add Staff
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button 
            onClick={loadStaffFromDatabase}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      )}

      {/* Staff Form (Add/Edit) */}
      {showForm && (
        <div className="add-staff-form">
          <h3>{isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
          <form onSubmit={handleSaveStaff}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={currentStaff.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={currentStaff.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                  disabled={saving}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Specialization *</label>
                <select
                  name="specialization"
                  value={currentStaff.specialization}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                >
                  <option value="">Select specialization</option>
                  <option value="Senior Stylist">Senior Stylist</option>
                  <option value="Color Specialist">Color Specialist</option>
                  <option value="Nail Technician">Nail Technician</option>
                  <option value="Skincare Specialist">Skincare Specialist</option>
                  <option value="Massage Therapist">Massage Therapist</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={currentStaff.status}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={saving}
              >
                {saving ? 'Saving...' : (isEditing ? 'Update Staff' : 'Add Staff')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Table */}
      <div className="staff-table-container">
        <div className="staff-table">
          <div className="table-header">
            <div className="table-cell id-column">ID</div>
            <div className="table-cell name-column">Name</div>
            <div className="table-cell email-column">Email</div>
            <div className="table-cell specialization-column">Specialization</div>
            <div className="table-cell status-column">Status</div>
            <div className="table-cell actions-column">Actions</div>
          </div>
          
          {loading ? (
            <div className="loading-row">
              <div className="table-cell" colSpan="6">
                ⏳ Loading staff from database...
              </div>
            </div>
          ) : staffMembers.length === 0 ? (
            <div className="empty-row">
              <div className="table-cell" colSpan="6">
                📭 No staff members found. Click "Add Staff" to add new members.
              </div>
            </div>
          ) : (
            staffMembers.map(staff => (
              <div key={staff.id || staff._id} className="table-row">
                <div className="table-cell id-column">
                  #{staff.id ? staff.id.toString().substring(0, 8) : (staff._id ? staff._id.toString().substring(0, 8) : 'N/A')}
                </div>
                <div className="table-cell name-column">{staff.name || 'Unknown'}</div>
                <div className="table-cell email-column">{staff.email || 'No email'}</div>
                <div className="table-cell specialization-column">{staff.specialization || 'Not specified'}</div>
                <div className="table-cell status-column">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(staff.status) }}
                  >
                    {staff.status || 'Unknown'}
                  </span>
                </div>
                <div className="table-cell actions-column">
                  <button 
                    className="action-btn edit" 
                    onClick={() => handleEdit(staff)}
                    disabled={saving}
                  >
                    Edit
                  </button>
                  <button 
                    className="action-btn delete" 
                    onClick={() => handleDelete(staff.id || staff._id)}
                    disabled={saving}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Table footer info */}
      {!loading && staffMembers.length > 0 && (
        <div className="table-footer">
          Showing {staffMembers.length} staff member{staffMembers.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default StaffTable;