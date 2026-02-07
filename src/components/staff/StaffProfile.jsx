// src/components/staff/StaffProfile.jsx - UPDATED AS REQUESTED
import React, { useState, useCallback } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Edit2,
  Save,
  X,
  Camera,
  Upload,
  Trash2,
  Badge,
  Shield
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
    staffId: user?.id?.slice(0, 8) || 'STF001'
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

  const handleSave = async () => {
    try {
      const token = getAuthToken();
      
      // Prepare data for API call
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        specialization: profileData.specialization
      };
      
      console.log('Saving profile:', updateData);
      
      // Make API call to update profile
      const response = await fetch(`${API_BASE_URL}/api/staff/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile updated:', data);
        
        // If there's a new profile picture to upload, do it
        if (profilePicFile) {
          await handleProfilePicUpload();
        }
        
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Update failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save profile: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || 'John Doe',
      email: user?.email || 'john@example.com',
      phone: user?.phone || '+1 (555) 123-4567',
      specialization: user?.specialization || 'Hair Stylist',
      staffId: user?.id?.slice(0, 8) || 'STF001'
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
        <p>Manage your personal information</p>
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
              <div className="staff-id-display">
                <Badge size={14} />
                <span className="staff-id">Staff ID: {profileData.staffId}</span>
              </div>
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
                    placeholder="Enter your full name"
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
                    placeholder="Enter your email"
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
                    placeholder="Enter your phone number"
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
                    placeholder="Enter your specialization"
                  />
                ) : (
                  <div className="field-value">{profileData.specialization}</div>
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
            <h4>Account Security</h4>
            <div className="account-info">
              <div className="info-item">
                <span className="info-label">Account Type</span>
                <span className="info-value">Staff</span>
              </div>
              <div className="info-item">
                <span className="info-label">Permissions</span>
                <span className="info-value">Appointments Only</span>
              </div>
            </div>
            <button className="security-btn">
              <Shield size={14} />
              View Security Settings
            </button>
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