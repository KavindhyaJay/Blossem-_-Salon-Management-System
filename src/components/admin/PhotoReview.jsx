// src/components/admin/PhotoReview.jsx - UPDATED WITH adminp- PREFIX
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

  // Fetch photo stats from backend
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
        setStats(data || { pending: 0, approved: 0, rejected: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching photo stats:', error);
    }
  }, [API_BASE_URL]);

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

  // Initialize
  useEffect(() => {
    const initializeData = async () => {
      await fetchPendingPhotos();
      await fetchPhotoStats();
      await fetchPendingCount();
    };
    
    initializeData();
  }, []);

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
    <div className="adminp-photo-review-container">
      {/* Header */}
      <div className="adminp-photo-review-header">
        <div>
          <h2>
            <Image size={24} style={{ marginRight: '10px' }} />
            Photo Review Dashboard
          </h2>
          <p>Review and approve staff uploaded photos for website gallery</p>
        </div>
        
        <button 
          className="adminp-refresh-btn"
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
      <div className="adminp-photo-stats-grid">
        <div className="adminp-photo-stat-card">
          <div className="adminp-photo-stat-header">
            <h3>Pending Review</h3>
            <div className="adminp-photo-stat-icon">⏳</div>
          </div>
          <div className="adminp-photo-stat-value">{stats.pending}</div>
          <div className="adminp-photo-stat-subtitle">Awaiting approval</div>
        </div>
        
        <div className="adminp-photo-stat-card">
          <div className="adminp-photo-stat-header">
            <h3>Approved</h3>
            <div className="adminp-photo-stat-icon">✅</div>
          </div>
          <div className="adminp-photo-stat-value">{stats.approved}</div>
          <div className="adminp-photo-stat-subtitle">Live on website</div>
        </div>
        
        <div className="adminp-photo-stat-card">
          <div className="adminp-photo-stat-header">
            <h3>Rejected</h3>
            <div className="adminp-photo-stat-icon">❌</div>
          </div>
          <div className="adminp-photo-stat-value">{stats.rejected}</div>
          <div className="adminp-photo-stat-subtitle">Not approved</div>
        </div>
        
        <div className="adminp-photo-stat-card">
          <div className="adminp-photo-stat-header">
            <h3>Total Photos</h3>
            <div className="adminp-photo-stat-icon">📷</div>
          </div>
          <div className="adminp-photo-stat-value">{stats.total}</div>
          <div className="adminp-photo-stat-subtitle">All time</div>
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="adminp-photo-loading">
          <div className="adminp-loading-spinner"></div>
          <p>Loading photos from database...</p>
        </div>
      ) : (
        <>
          {/* Photo Details Modal */}
          {reviewingPhoto && (
            <div className="adminp-photo-modal-overlay">
              <div className="adminp-photo-modal">
                <div className="adminp-modal-header">
                  <h3>Photo Details</h3>
                  <button 
                    className="adminp-modal-close-btn"
                    onClick={() => setReviewingPhoto(null)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="adminp-modal-body">
                  <div className="adminp-photo-fullsize-container">
                    {reviewingPhoto.imageUrl ? (
                      <img 
                        src={reviewingPhoto.imageUrl} 
                        alt={reviewingPhoto.title || 'Staff photo'}
                        className="adminp-photo-fullsize"
                      />
                    ) : (
                      <div className="adminp-no-image-thumb">
                        <Image size={32} />
                        <span>No image available</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="adminp-photo-details">
                    <div className="adminp-detail-row">
                      <span className="adminp-detail-label">Title:</span>
                      <span className="adminp-detail-value">{reviewingPhoto.title || 'Untitled'}</span>
                    </div>
                    <div className="adminp-detail-row">
                      <span className="adminp-detail-label">Staff:</span>
                      <span className="adminp-detail-value">{reviewingPhoto.staffName || 'Unknown'}</span>
                    </div>
                    <div className="adminp-detail-row">
                      <span className="adminp-detail-label">Category:</span>
                      <span className="adminp-detail-value">{reviewingPhoto.category || 'OTHER'}</span>
                    </div>
                    <div className="adminp-detail-row">
                      <span className="adminp-detail-label">Uploaded:</span>
                      <span className="adminp-detail-value">{formatDate(reviewingPhoto.uploadedAt)}</span>
                    </div>
                    {reviewingPhoto.description && (
                      <div className="adminp-detail-row">
                        <span className="adminp-detail-label">Description:</span>
                        <span className="adminp-detail-value">{reviewingPhoto.description}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Rejection reason input */}
                  {rejectionReason && (
                    <div className="adminp-rejection-section">
                      <label>Rejection Reason:</label>
                      <textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide reason for rejection..."
                        rows={3}
                        className="adminp-rejection-textarea"
                      />
                    </div>
                  )}
                  
                  <div className="adminp-modal-actions">
                    <button 
                      className="adminp-modal-btn adminp-modal-approve"
                      onClick={() => handleApprove(reviewingPhoto.id)}
                    >
                      <CheckCircle size={16} />
                      Approve Photo
                    </button>
                    
                    <button 
                      className="adminp-modal-btn adminp-modal-reject"
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
            <div className="adminp-photo-empty-state">
              <div className="adminp-photo-empty-icon">📷</div>
              <h4>No Photos Pending Review</h4>
              <p>All staff photos have been reviewed. Check back later for new uploads.</p>
              <p className="hint">Staff can upload photos from their dashboard</p>
            </div>
          ) : (
            <div className="adminp-photos-grid-container">
              <div className="adminp-photos-grid-header">
                <h3>Photos Pending Approval ({photos.length})</h3>
                <div className="adminp-batch-actions">
                  <button className="adminp-batch-btn">
                    Select All
                  </button>
                  <button className="adminp-batch-btn adminp-batch-approve">
                    <CheckCircle size={14} />
                    Approve Selected
                  </button>
                </div>
              </div>
              
              <div className="adminp-photos-grid">
                {photos.map((photo) => (
                  <div key={photo.id} className="adminp-photo-card">
                    {/* Photo Thumbnail */}
                    <div className="adminp-photo-thumbnail">
                      {photo.imageUrl ? (
                        <img 
                          src={photo.imageUrl} 
                          alt={photo.title || 'Staff photo'}
                          onClick={() => handleViewDetails(photo.id)}
                        />
                      ) : (
                        <div className="adminp-no-image-thumb">
                          <Image size={32} />
                          <span>No image</span>
                        </div>
                      )}
                      
                      {/* Status badge */}
                      <div className={`adminp-photo-status-badge adminp-status-${photo.status?.toLowerCase()}`}>
                        {photo.status || 'PENDING'}
                      </div>
                    </div>
                    
                    {/* Photo Info */}
                    <div className="adminp-photo-card-info">
                      <h4 className="adminp-photo-title" title={photo.title}>
                        {photo.title || 'Untitled Photo'}
                      </h4>
                      
                      <div className="adminp-photo-meta">
                        <div className="adminp-meta-item">
                          <span className="adminp-meta-label">Staff:</span>
                          <span className="adminp-meta-value">{photo.staffName || 'Unknown'}</span>
                        </div>
                        <div className="adminp-meta-item">
                          <span className="adminp-meta-label">Category:</span>
                          <span className="adminp-meta-value adminp-category-tag">{photo.category || 'OTHER'}</span>
                        </div>
                        <div className="adminp-meta-item">
                          <span className="adminp-meta-label">Uploaded:</span>
                          <span className="adminp-meta-value">{formatDate(photo.uploadedAt)}</span>
                        </div>
                      </div>
                      
                      {photo.description && (
                        <p className="adminp-photo-description" title={photo.description}>
                          {photo.description.length > 80 
                            ? `${photo.description.substring(0, 80)}...` 
                            : photo.description}
                        </p>
                      )}
                      
                      {/* Quick Actions */}
                      <div className="adminp-photo-actions">
                        <button 
                          className="adminp-action-btn adminp-btn-view"
                          onClick={() => handleViewDetails(photo.id)}
                          title="View details"
                        >
                          <Eye size={14} />
                          Details
                        </button>
                        
                        <button 
                          className="adminp-action-btn adminp-btn-approve"
                          onClick={() => handleApprove(photo.id)}
                          title="Approve photo"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        
                        <button 
                          className="adminp-action-btn adminp-btn-reject"
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