// src/components/admin/PhotoReview.jsx - FIXED NO INFINITE LOOP
import React, { useState, useEffect, useCallback } from 'react';
import { Image, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';
import './PhotoReview.css';

const PhotoReview = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [reviewingPhoto, setReviewingPhoto] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

  // Get auth token - SIMPLE FUNCTION (no need for useCallback)
  const getAuthToken = () => {
    let token = localStorage.getItem('adminToken');
    if (!token) token = localStorage.getItem('token');
    if (!token) token = localStorage.getItem('authToken');
    return token;
  };

  // Fetch pending photos from backend
  const fetchPendingPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/admin/photos?status=PENDING`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch photos:', response.status);
        return;
      }
      
      const data = await response.json();
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Fetch photo stats from backend - FIXED: remove stats from dependencies
  const fetchPhotoStats = useCallback(async () => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/admin/photos/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data || { pending: 0, approved: 0, rejected: 0, total: 0 }); // Use default object
      }
    } catch (error) {
      console.error('Error fetching photo stats:', error);
    }
  }, [API_BASE_URL]); // REMOVED 'stats' dependency

  // Get pending count for badge
  const fetchPendingCount = useCallback(async () => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/admin/photos/pending-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({ ...prev, pending: data.pendingCount || 0 }));
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  }, [API_BASE_URL]);

  // Approve photo
  const handleApprove = async (photoId) => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/admin/photos/${photoId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          approve: true,
          rejectionReason: null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve photo');
      }
      
      const data = await response.json();
      alert(data.message || 'Photo approved successfully!');
      
      // Refresh data
      fetchPendingPhotos();
      fetchPhotoStats();
      
    } catch (error) {
      console.error('Error approving photo:', error);
      alert(`Failed to approve photo: ${error.message}`);
    }
  };

  // Reject photo
  const handleReject = async (photoId, reason = 'Does not meet guidelines') => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/admin/photos/${photoId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          approve: false,
          rejectionReason: reason
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject photo');
      }
      
      const data = await response.json();
      alert(data.message || 'Photo rejected!');
      
      // Refresh data
      fetchPendingPhotos();
      fetchPhotoStats();
      setReviewingPhoto(null);
      setRejectionReason('');
      
    } catch (error) {
      console.error('Error rejecting photo:', error);
      alert(`Failed to reject photo: ${error.message}`);
    }
  };

  // Get photo details
  const handleViewDetails = async (photoId) => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/admin/photos/${photoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const photoDetails = await response.json();
        setReviewingPhoto(photoDetails);
      }
    } catch (error) {
      console.error('Error fetching photo details:', error);
    }
  };

  // Initialize - FIXED: Use empty dependency array
  useEffect(() => {
    const initializeData = async () => {
      await fetchPendingPhotos();
      await fetchPhotoStats();
      await fetchPendingCount();
    };
    
    initializeData();
  }, []); // Empty dependency array - only run once on mount

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div className="content-header">
        <div>
          <h2>
            <Image size={24} style={{ marginRight: '10px' }} />
            Photo Review Dashboard
          </h2>
          <p>Review and approve staff uploaded photos for website gallery</p>
        </div>
        
        <button 
          className="action-btn refresh-btn"
          onClick={() => {
            fetchPendingPhotos();
            fetchPhotoStats();
            fetchPendingCount();
          }}
          disabled={loading}
        >
          <RefreshCw size={18} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Pending Review</h3>
            <div className="stat-icon">⏳</div>
          </div>
          <div className="stat-value pending">{stats.pending}</div>
          <div className="stat-subtitle">Awaiting approval</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Approved</h3>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-value completed">{stats.approved}</div>
          <div className="stat-subtitle">Live on website</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Rejected</h3>
            <div className="stat-icon">❌</div>
          </div>
          <div className="stat-value cancelled">{stats.rejected}</div>
          <div className="stat-subtitle">Not approved</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Photos</h3>
            <div className="stat-icon">📷</div>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-subtitle">All time</div>
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading photos from database...</p>
        </div>
      ) : (
        <>
          {/* Photo Details Modal */}
          {reviewingPhoto && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Photo Details</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setReviewingPhoto(null)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="photo-preview-large">
                    {reviewingPhoto.imageUrl ? (
                      <img 
                        src={reviewingPhoto.imageUrl} 
                        alt={reviewingPhoto.title || 'Staff photo'}
                        className="photo-fullsize"
                      />
                    ) : (
                      <div className="no-image">No image available</div>
                    )}
                  </div>
                  
                  <div className="photo-info">
                    <div className="info-row">
                      <span className="info-label">Title:</span>
                      <span className="info-value">{reviewingPhoto.title || 'Untitled'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Staff:</span>
                      <span className="info-value">{reviewingPhoto.staffName || 'Unknown'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Category:</span>
                      <span className="info-value">{reviewingPhoto.category || 'OTHER'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Uploaded:</span>
                      <span className="info-value">{formatDate(reviewingPhoto.uploadedAt)}</span>
                    </div>
                    {reviewingPhoto.description && (
                      <div className="info-row">
                        <span className="info-label">Description:</span>
                        <span className="info-value">{reviewingPhoto.description}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Rejection reason input */}
                  {rejectionReason && (
                    <div className="rejection-section">
                      <label>Rejection Reason:</label>
                      <textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide reason for rejection..."
                        rows={3}
                      />
                    </div>
                  )}
                  
                  <div className="modal-actions">
                    <button 
                      className="btn-success"
                      onClick={() => handleApprove(reviewingPhoto.id)}
                    >
                      <CheckCircle size={16} />
                      Approve Photo
                    </button>
                    
                    <button 
                      className="btn-danger"
                      onClick={() => handleReject(reviewingPhoto.id, rejectionReason || 'Quality not up to standard')}
                    >
                      <XCircle size={16} />
                      Reject Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Photos List */}
          {photos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📷</div>
              <h4>No Photos Pending Review</h4>
              <p>All staff photos have been reviewed. Check back later for new uploads.</p>
              <p className="hint">Staff can upload photos from their dashboard</p>
            </div>
          ) : (
            <div className="table-container">
              <div className="table-header">
                <h3>Photos Pending Approval ({photos.length})</h3>
                <div className="batch-actions">
                  <button className="btn-secondary">
                    Select All
                  </button>
                  <button className="btn-success">
                    <CheckCircle size={14} />
                    Approve Selected
                  </button>
                </div>
              </div>
              
              <div className="photos-grid">
                {photos.map((photo) => (
                  <div key={photo.id} className="photo-card">
                    {/* Photo Thumbnail */}
                    <div className="photo-thumbnail">
                      {photo.imageUrl ? (
                        <img 
                          src={photo.imageUrl} 
                          alt={photo.title || 'Staff photo'}
                          onClick={() => handleViewDetails(photo.id)}
                        />
                      ) : (
                        <div className="no-image-thumb">
                          <Image size={32} />
                          <span>No image</span>
                        </div>
                      )}
                      
                      {/* Status badge */}
                      <div className={`status-badge status-${photo.status?.toLowerCase()}`}>
                        {photo.status || 'PENDING'}
                      </div>
                    </div>
                    
                    {/* Photo Info */}
                    <div className="photo-card-info">
                      <h4 className="photo-title" title={photo.title}>
                        {photo.title || 'Untitled Photo'}
                      </h4>
                      
                      <div className="photo-meta">
                        <div className="meta-item">
                          <span className="meta-label">Staff:</span>
                          <span className="meta-value">{photo.staffName || 'Unknown'}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Category:</span>
                          <span className="meta-value category">{photo.category || 'OTHER'}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Uploaded:</span>
                          <span className="meta-value">{formatDate(photo.uploadedAt)}</span>
                        </div>
                      </div>
                      
                      {photo.description && (
                        <p className="photo-desc" title={photo.description}>
                          {photo.description.length > 80 
                            ? `${photo.description.substring(0, 80)}...` 
                            : photo.description}
                        </p>
                      )}
                      
                      {/* Quick Actions */}
                      <div className="photo-actions">
                        <button 
                          className="btn-view"
                          onClick={() => handleViewDetails(photo.id)}
                          title="View details"
                        >
                          <Eye size={14} />
                          Details
                        </button>
                        
                        <button 
                          className="btn-approve"
                          onClick={() => handleApprove(photo.id)}
                          title="Approve photo"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        
                        <button 
                          className="btn-reject"
                          onClick={() => handleReject(photo.id, 'Quality not up to standard')}
                          title="Reject photo"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PhotoReview;