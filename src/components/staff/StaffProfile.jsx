// src/components/staff/StaffProfile.jsx - WITH PROFILE PICTURE UPLOAD
import React, { useState, useCallback } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit2,
  Save,
  X,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import './StaffProfile.css';

const StaffProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    phone: user?.phone || '+1 (555) 123-4567',
    specialization: user?.specialization || 'Hair Stylist',
    experience: user?.experience || '5 years',
    location: user?.location || 'New York, NY',
    bio: user?.bio || 'Experienced hair stylist specializing in modern cuts and color techniques.',
    profilePicture: user?.profilePicture || null
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || 
           localStorage.getItem('staffToken') || 
           localStorage.getItem('authToken');
  }, []);

  // Handle profile picture selection
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload profile picture
  const handleProfilePicUpload = async () => {
    if (!profilePicFile) return;
    
    setUploadingProfilePic(true);
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('profilePicture', profilePicFile);
      
      const response = await fetch(`${API_BASE_URL}/api/staff/profile/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({ ...prev, profilePicture: data.profilePicture }));
        alert('Profile picture updated successfully!');
        
        // Clear the file input
        setProfilePicFile(null);
        document.getElementById('profile-pic-upload').value = '';
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload profile picture: ${error.message}`);
    } finally {
      setUploadingProfilePic(false);
    }
  };

  // Remove profile picture
  const handleRemoveProfilePic = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/staff/profile/picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setProfileData(prev => ({ ...prev, profilePicture: null }));
        setProfilePicPreview(null);
        setProfilePicFile(null);
        alert('Profile picture removed successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Remove failed');
      }
    } catch (error) {
      console.error('Remove error:', error);
      alert(`Failed to remove profile picture: ${error.message}`);
    }
  };

  const handleSave = () => {
    // In a real app, you would make an API call here
    console.log('Saving profile:', profileData);
    
    // If there's a new profile picture to upload, do it first
    if (profilePicFile) {
      handleProfilePicUpload();
    }
    
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || 'John Doe',
      email: user?.email || 'john@example.com',
      phone: user?.phone || '+1 (555) 123-4567',
      specialization: user?.specialization || 'Hair Stylist',
      experience: user?.experience || '5 years',
      location: user?.location || 'New York, NY',
      bio: user?.bio || 'Experienced hair stylist specializing in modern cuts and color techniques.',
      profilePicture: user?.profilePicture || null
    });
    setProfilePicPreview(null);
    setProfilePicFile(null);
    setIsEditing(false);
  };

  return (
    <div className="staff-profile">
      {/* Header */}
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>Manage your personal information and preferences</p>
      </div>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h3>
              <User size={20} />
              Personal Information
            </h3>
            
            {!isEditing ? (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="action-buttons">
                <button className="cancel-btn" onClick={handleCancel}>
                  <X size={16} />
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSave}>
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              <div className="profile-picture-wrapper">
                {profilePicPreview || profileData.profilePicture ? (
                  <img 
                    src={profilePicPreview || profileData.profilePicture} 
                    alt="Profile" 
                    className="profile-picture"
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    <User size={48} />
                  </div>
                )}
                
                {isEditing && (
                  <div className="profile-picture-overlay">
                    <label htmlFor="profile-pic-upload" className="upload-icon-btn">
                      <Camera size={20} />
                    </label>
                    {profilePicPreview || profileData.profilePicture ? (
                      <button 
                        className="remove-icon-btn"
                        onClick={handleRemoveProfilePic}
                        title="Remove picture"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
              
              {isEditing && (
                <div className="profile-picture-actions">
                  <input
                    id="profile-pic-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="profile-pic-upload" className="upload-btn-small">
                    <Upload size={14} />
                    {profilePicPreview || profileData.profilePicture ? 'Change Photo' : 'Upload Photo'}
                  </label>
                  {uploadingProfilePic && (
                    <span className="uploading-text">Uploading...</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="profile-picture-info">
              <h4>{profileData.name}</h4>
              <p className="profile-role">{profileData.specialization}</p>
              <p className="profile-location">
                <MapPin size={14} />
                {profileData.location}
              </p>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-section">
              <div className="profile-field">
                <label>
                  <User size={16} />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                ) : (
                  <div className="field-value">{profileData.name}</div>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <Mail size={16} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                ) : (
                  <div className="field-value">{profileData.email}</div>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <Phone size={16} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                ) : (
                  <div className="field-value">{profileData.phone}</div>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <User size={16} />
                  Specialization
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.specialization}
                    onChange={(e) => setProfileData(prev => ({ ...prev, specialization: e.target.value }))}
                  />
                ) : (
                  <div className="field-value">{profileData.specialization}</div>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <Calendar size={16} />
                  Experience
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.experience}
                    onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                  />
                ) : (
                  <div className="field-value">{profileData.experience}</div>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <MapPin size={16} />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  />
                ) : (
                  <div className="field-value">{profileData.location}</div>
                )}
              </div>
            </div>

            <div className="profile-section">
              <div className="profile-field full-width">
                <label>Bio / Description</label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                  />
                ) : (
                  <div className="field-value">{profileData.bio}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="stats-sidebar">
          <div className="stat-card">
            <h4>Profile Status</h4>
            <div className="status-indicator active">
              <div className="status-dot"></div>
              Active
            </div>
            <p className="status-info">Your profile is visible to customers</p>
          </div>

          <div className="stat-card">
            <h4>Account Details</h4>
            <div className="account-info">
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">Jan 2024</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated</span>
                <span className="info-value">Today</span>
              </div>
              <div className="info-item">
                <span className="info-label">Staff ID</span>
                <span className="info-value">{user?.id?.slice(0, 8) || 'STF001'}</span>
              </div>
            </div>
          </div>
          
          {/* Profile Picture Tips */}
          <div className="stat-card">
            <h4>Profile Picture Tips</h4>
            <div className="tips-list">
              <p className="tip-item">• Use a professional headshot</p>
              <p className="tip-item">• Good lighting and clear face</p>
              <p className="tip-item">• Smile and look approachable</p>
              <p className="tip-item">• File size under 5MB</p>
              <p className="tip-item">• JPG or PNG format</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;