// src/components/admin/PhotoReview.jsx
import React, { useState, useEffect } from 'react';
import { Image, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import axios from 'axios';

const PhotoReview = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const API_BASE_URL = 'http://localhost:8081';

  // Fetch pending photos
  const fetchPendingPhotos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/photos?status=PENDING`);
      setPhotos(response.data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch photo stats
  const fetchPhotoStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/photos/stats`);
      setStats(response.data || stats);
    } catch (error) {
      console.error('Error fetching photo stats:', error);
    }
  };

  // Approve photo
  const handleApprove = async (photoId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/photos/${photoId}/review`, {
        status: 'APPROVED'
      });
      alert('Photo approved successfully!');
      fetchPendingPhotos();
      fetchPhotoStats();
    } catch (error) {
      console.error('Error approving photo:', error);
      alert('Failed to approve photo');
    }
  };

  // Reject photo
  const handleReject = async (photoId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/photos/${photoId}/review`, {
        status: 'REJECTED'
      });
      alert('Photo rejected successfully!');
      fetchPendingPhotos();
      fetchPhotoStats();
    } catch (error) {
      console.error('Error rejecting photo:', error);
      alert('Failed to reject photo');
    }
  };

  useEffect(() => {
    fetchPendingPhotos();
    fetchPhotoStats();
  }, []);

  return (
    <div className="main-content">
      <div className="content-header">
        <h2>
          <Image size={24} style={{ marginRight: '10px' }} />
          Photo Review
        </h2>
        <p>Review and approve staff uploaded photos</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <h3>Pending Review</h3>
            <div className="stat-icon">
              <Image size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.pending}</div>
          <p className="stat-desc">Awaiting approval</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Approved</h3>
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.approved}</div>
          <p className="stat-desc">Visible on website</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Rejected</h3>
            <div className="stat-icon">
              <XCircle size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.rejected}</div>
          <p className="stat-desc">Not approved</p>
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading photos...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="empty-state" style={{ 
          textAlign: 'center', 
          padding: '60px 30px',
          background: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <Image size={48} style={{ opacity: 0.3, marginBottom: '20px' }} />
          <h4 style={{ color: '#ccc', marginBottom: '10px' }}>No photos pending review</h4>
          <p>All photos have been reviewed. Check back later for new uploads.</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-header">
            <h3>
              Photos Pending Approval 
              <span className="table-count">({photos.length})</span>
            </h3>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            padding: '25px'
          }}>
            {photos.map((photo) => (
              <div key={photo.id} style={{
                background: '#141414',
                border: '1px solid #333',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {/* Photo Preview */}
                <div style={{
                  height: '200px',
                  background: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {photo.imageUrl ? (
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.customerName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Image size={48} style={{ opacity: 0.2, color: '#888' }} />
                  )}
                </div>
                
                {/* Photo Info */}
                <div style={{ padding: '20px' }}>
                  <h4 style={{ 
                    color: 'white', 
                    marginBottom: '10px',
                    fontSize: '18px'
                  }}>
                    {photo.customerName || 'Customer'}
                  </h4>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ccc', fontSize: '14px' }}>Service:</span>
                      <span style={{ color: 'white', fontWeight: '500' }}>
                        {photo.service || 'Not specified'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ccc', fontSize: '14px' }}>Uploaded by:</span>
                      <span style={{ color: 'white', fontWeight: '500' }}>
                        {photo.staffName || 'Staff'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ccc', fontSize: '14px' }}>Date:</span>
                      <span style={{ color: 'white', fontWeight: '500' }}>
                        {new Date(photo.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px',
                    borderTop: '1px solid #333',
                    paddingTop: '20px'
                  }}>
                    <button
                      className="btn-primary"
                      onClick={() => handleApprove(photo.id)}
                      style={{ flex: 1 }}
                    >
                      <CheckCircle size={16} style={{ marginRight: '8px' }} />
                      Approve
                    </button>
                    
                    <button
                      className="btn-secondary"
                      onClick={() => handleReject(photo.id)}
                      style={{ flex: 1 }}
                    >
                      <XCircle size={16} style={{ marginRight: '8px' }} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoReview;