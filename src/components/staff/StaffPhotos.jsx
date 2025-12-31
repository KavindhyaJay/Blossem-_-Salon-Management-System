// src/components/staff/StaffPhotos.jsx - MODIFIED TO SHOW ALL STAFF PHOTOS
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Trash2,
  RefreshCw,
  Filter,
  User,
  Check,
  X
} from 'lucide-react';
import './StaffPhotos.css';

const StaffPhotos = ({ user, userRole = 'staff' }) => {
  const [myPhotos, setMyPhotos] = useState([]); // Current staff's photos
  const [allStaffPhotos, setAllStaffPhotos] = useState([]); // All staff photos for admin
  const [loading, setLoading] = useState(false);
  const [loadingAllPhotos, setLoadingAllPhotos] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('pending'); // For admin section
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'HAIR',
    file: null
  });
  const [preview, setPreview] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || 
           localStorage.getItem('staffToken') || 
           localStorage.getItem('authToken');
  }, []);

  const categories = [
    { value: 'HAIR', label: 'Hair Styling' },
    { value: 'COLOR', label: 'Hair Color' },
    { value: 'NAILS', label: 'Nails' },
    { value: 'MAKEUP', label: 'Makeup' },
    { value: 'SKINCARE', label: 'Skincare' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Fetch current staff's photos
  const fetchMyPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/staff/photos/my-photos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching my photos:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Fetch all staff photos (for admin view)
  const fetchAllStaffPhotos = useCallback(async () => {
    setLoadingAllPhotos(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/staff/photos/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllStaffPhotos(data.photos || []);
      } else {
        // Fallback: If /all endpoint doesn't exist, try to get from admin endpoint
        const adminResponse = await fetch(`${API_BASE_URL}/api/admin/photos/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          setAllStaffPhotos(adminData.photos || []);
        }
      }
    } catch (error) {
      console.error('Error fetching all staff photos:', error);
    } finally {
      setLoadingAllPhotos(false);
    }
  }, [API_BASE_URL, getAuthToken]);

  useEffect(() => {
    fetchMyPhotos();
    
    // If user is admin, also fetch all staff photos
    if (userRole === 'admin') {
      fetchAllStaffPhotos();
    }
  }, [fetchMyPhotos, fetchAllStaffPhotos, userRole]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadData.file) {
      alert('Please select a photo to upload');
      return;
    }

    if (!uploadData.title.trim()) {
      alert('Please enter a title for the photo');
      return;
    }

    setUploading(true);
    
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);

      const response = await fetch(`${API_BASE_URL}/api/staff/photos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Photo uploaded successfully! Waiting for admin approval.');
        
        // Reset form
        setUploadData({
          title: '',
          description: '',
          category: 'HAIR',
          file: null
        });
        setPreview(null);
        document.getElementById('file-upload').value = '';
        
        // Refresh photos list
        fetchMyPhotos();
        
        // If admin, also refresh all photos
        if (userRole === 'admin') {
          fetchAllStaffPhotos();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Delete photo (only allowed for own photos or admin)
  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/staff/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        alert('Photo deleted successfully');
        fetchMyPhotos();
        
        // If admin, also refresh all photos
        if (userRole === 'admin') {
          fetchAllStaffPhotos();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  // Approve photo (admin only)
  const handleApprove = async (photoId) => {
    if (!window.confirm('Approve this photo for public gallery?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/staff/photos/${photoId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        alert('Photo approved successfully');
        fetchAllStaffPhotos();
        fetchMyPhotos(); // Refresh own photos too
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Approval failed');
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert(`Approval failed: ${error.message}`);
    }
  };

  // Reject photo (admin only)
  const handleReject = async (photoId) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason === null) return; // User cancelled
    if (!reason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/staff/photos/${photoId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('Photo rejected successfully');
        fetchAllStaffPhotos();
        fetchMyPhotos(); // Refresh own photos too
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Rejection failed');
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert(`Rejection failed: ${error.message}`);
    }
  };

  // Filter my photos
  const filteredMyPhotos = myPhotos.filter(photo => {
    if (filter === 'all') return true;
    return photo.status === filter;
  });

  // Filter all staff photos for admin
  const filteredAllPhotos = allStaffPhotos.filter(photo => {
    if (adminFilter === 'pending') return photo.status === 'PENDING';
    if (adminFilter === 'approved') return photo.status === 'APPROVED';
    if (adminFilter === 'rejected') return photo.status === 'REJECTED';
    return true;
  });

  // Get stats for my photos
  const myStats = {
    total: myPhotos.length,
    pending: myPhotos.filter(p => p.status === 'PENDING').length,
    approved: myPhotos.filter(p => p.status === 'APPROVED').length,
    rejected: myPhotos.filter(p => p.status === 'REJECTED').length
  };

  // Get stats for all photos (admin view)
  const allStats = {
    total: allStaffPhotos.length,
    pending: allStaffPhotos.filter(p => p.status === 'PENDING').length,
    approved: allStaffPhotos.filter(p => p.status === 'APPROVED').length,
    rejected: allStaffPhotos.filter(p => p.status === 'REJECTED').length
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="staff-photos">
      {/* Header */}
      <div className="photos-header">
        <h2>
          <ImageIcon size={28} />
          {userRole === 'admin' ? 'Staff Photo Gallery' : 'My Photo Gallery'}
        </h2>
        <p>
          {userRole === 'admin' 
            ? 'Manage all staff photos and approval requests' 
            : 'Upload your work photos and track their approval status'}
        </p>
      </div>

      {/* Upload Section (only for staff) */}
      {userRole === 'staff' && (
        <div className="upload-section">
          <div className="upload-card">
            <h3>
              <Upload size={20} />
              Upload New Photo
            </h3>
            
            <form onSubmit={handleUpload}>
              <div className="upload-form">
                {/* File Upload */}
                <div className="upload-area" onClick={() => document.getElementById('file-upload').click()}>
                  {preview ? (
                    <div className="preview-container">
                      <img src={preview} alt="Preview" className="preview-image" />
                      <div className="preview-overlay">
                        <Upload size={24} />
                        <span>Change Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={32} />
                      <p>Click to select photo</p>
                      <p className="upload-hint">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Form Fields */}
                <div className="form-fields">
                  <div className="form-group">
                    <label>Photo Title *</label>
                    <input
                      type="text"
                      value={uploadData.title}
                      onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., 'Modern Haircut Style'"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={uploadData.category}
                      onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <textarea
                      value={uploadData.description}
                      onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the service or style..."
                      rows={3}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="upload-btn"
                    disabled={uploading || !uploadData.file || !uploadData.title.trim()}
                  >
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className="stats-card">
            <h3>My Upload Stats</h3>
            <div className="stats-grid">
              <div className="stat-item total">
                <span className="stat-label">Total Uploads</span>
                <span className="stat-value">{myStats.total}</span>
              </div>
              <div className="stat-item pending">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{myStats.pending}</span>
              </div>
              <div className="stat-item approved">
                <span className="stat-label">Approved</span>
                <span className="stat-value">{myStats.approved}</span>
              </div>
              <div className="stat-item rejected">
                <span className="stat-label">Rejected</span>
                <span className="stat-value">{myStats.rejected}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Photos Gallery (for staff) or All Photos (for admin) */}
      <div className="gallery-section">
        <div className="section-header">
          <h3>
            <ImageIcon size={20} />
            {userRole === 'admin' ? 'All Staff Photos' : 'My Uploaded Photos'}
          </h3>
          
          <div className="gallery-controls">
            <div className="filter-control">
              <Filter size={16} />
              <select 
                value={userRole === 'admin' ? adminFilter : filter} 
                onChange={(e) => userRole === 'admin' ? setAdminFilter(e.target.value) : setFilter(e.target.value)}
              >
                {userRole === 'admin' ? (
                  <>
                    <option value="pending">Pending Review ({allStats.pending})</option>
                    <option value="approved">Approved ({allStats.approved})</option>
                    <option value="rejected">Rejected ({allStats.rejected})</option>
                    <option value="all">All Photos ({allStats.total})</option>
                  </>
                ) : (
                  <>
                    <option value="all">All Photos</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </>
                )}
              </select>
            </div>
            
            <button 
              className="refresh-btn"
              onClick={() => {
                fetchMyPhotos();
                if (userRole === 'admin') fetchAllStaffPhotos();
              }}
              disabled={loading || loadingAllPhotos}
            >
              <RefreshCw size={16} className={loading || loadingAllPhotos ? 'spinning' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading photos...</p>
          </div>
        ) : (userRole === 'admin' ? filteredAllPhotos : filteredMyPhotos).length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={48} />
            <h3>No Photos Found</h3>
            <p>
              {userRole === 'admin' 
                ? `No ${adminFilter} photos found` 
                : filter === 'all' 
                  ? 'Upload your first photo to get started!' 
                  : `No ${filter.toLowerCase()} photos found`}
            </p>
          </div>
        ) : (
          <div className="photo-grid">
            {(userRole === 'admin' ? filteredAllPhotos : filteredMyPhotos).map((photo) => (
              <div key={photo.id} className="photo-card">
                <div className="photo-preview">
                  {photo.imageUrl ? (
                    <img src={photo.imageUrl} alt={photo.title} />
                  ) : (
                    <div className="no-image">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  
                  <div className={`status-badge status-${photo.status.toLowerCase()}`}>
                    {photo.status}
                  </div>
                  
                  {/* Delete button for staff's own pending photos */}
                  {userRole === 'staff' && photo.status === 'PENDING' && (
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(photo.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  
                  {/* Admin approval buttons */}
                  {userRole === 'admin' && photo.status === 'PENDING' && (
                    <div className="admin-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApprove(photo.id)}
                        title="Approve Photo"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleReject(photo.id)}
                        title="Reject Photo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="photo-info">
                  <h4 className="photo-title" title={photo.title}>
                    {photo.title}
                  </h4>
                  
                  <div className="photo-meta">
                    <span className="category">{photo.category}</span>
                    <span className="date">
                      <Clock size={12} />
                      {formatDate(photo.uploadedAt)}
                    </span>
                  </div>
                  
                  {/* Staff info for admin view */}
                  {userRole === 'admin' && photo.staff && (
                    <div className="staff-info">
                      <User size={12} />
                      <span>{photo.staff.name || `Staff ID: ${photo.staffId}`}</span>
                    </div>
                  )}
                  
                  {photo.description && (
                    <p className="photo-description">
                      {photo.description}
                    </p>
                  )}
                  
                  <div className="status-info">
                    {photo.status === 'APPROVED' && (
                      <span className="approved-info">
                        <CheckCircle size={14} />
                        Approved for public gallery
                      </span>
                    )}
                    {photo.status === 'REJECTED' && (
                      <span className="rejected-info">
                        <XCircle size={14} />
                        {photo.rejectionReason || 'Not approved'}
                      </span>
                    )}
                    {photo.status === 'PENDING' && (
                      <span className="pending-info">
                        <AlertCircle size={14} />
                        {userRole === 'admin' 
                          ? 'Awaiting your approval' 
                          : 'Awaiting admin review'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Stats Section (only for admin) */}
      {userRole === 'admin' && (
        <div className="admin-stats-section">
          <div className="stats-card admin-stats">
            <h3>
              <ImageIcon size={20} />
              Gallery Statistics
            </h3>
            <div className="stats-grid">
              <div className="stat-item total">
                <span className="stat-label">Total Photos</span>
                <span className="stat-value">{allStats.total}</span>
              </div>
              <div className="stat-item pending">
                <span className="stat-label">Pending Review</span>
                <span className="stat-value">{allStats.pending}</span>
                <span className="stat-subtext">Need attention</span>
              </div>
              <div className="stat-item approved">
                <span className="stat-label">Approved</span>
                <span className="stat-value">{allStats.approved}</span>
                <span className="stat-subtext">In public gallery</span>
              </div>
              <div className="stat-item rejected">
                <span className="stat-label">Rejected</span>
                <span className="stat-value">{allStats.rejected}</span>
                <span className="stat-subtext">Not approved</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPhotos;