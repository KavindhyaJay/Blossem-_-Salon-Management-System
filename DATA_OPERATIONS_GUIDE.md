# 📊 Frontend Data Operations Guide

Complete guide for GET, POST, PUT, DELETE, and Upload operations in your React frontend.

---

## 🔑 Quick Reference

| Operation | Method | Code |
|-----------|--------|------|
| **GET All Data** | GET | `receptionService.getAllAppointments()` |
| **GET Single** | GET | `receptionService.getAppointmentById(id)` |
| **CREATE** | POST | `receptionService.createAppointment(data)` |
| **UPDATE** | PUT | `receptionService.updateAppointment(id, data)` |
| **DELETE** | DELETE | `receptionService.deleteAppointment(id)` |

---

## 📥 1. FETCH DATA (GET)

### 1.1 Get All Appointments
```jsx
import { receptionService } from '../services/receptionService';
import { useEffect, useState } from 'react';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await receptionService.getAllAppointments();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {appointments.map(apt => (
        <li key={apt._id}>
          {apt.customerName} - {apt.date}
        </li>
      ))}
    </ul>
  );
}
```

### 1.2 Get Single Appointment by ID
```jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { receptionService } from '../services/receptionService';

export default function AppointmentDetail() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const data = await receptionService.getAppointmentById(id);
        setAppointment(data);
      } catch (err) {
        console.error('Error fetching appointment:', err);
      }
    };

    if (id) {
      fetchAppointment();
    }
  }, [id]);

  if (!appointment) return <p>Loading...</p>;

  return (
    <div>
      <h2>{appointment.customerName}</h2>
      <p>Date: {appointment.date}</p>
      <p>Time: {appointment.time}</p>
      <p>Service: {appointment.service}</p>
    </div>
  );
}
```

### 1.3 Get Data with Filters
```jsx
import * as bookingService from '../services/bookingService';
import { useState } from 'react';

export default function BookingsByDate() {
  const [bookings, setBookings] = useState([]);
  const [date, setDate] = useState('2025-12-16');

  const handleFilter = async () => {
    try {
      const response = await bookingService.fetchByDate(date);
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  return (
    <div>
      <input 
        type="date" 
        value={date} 
        onChange={(e) => setDate(e.target.value)} 
      />
      <button onClick={handleFilter}>Filter by Date</button>
      <ul>
        {bookings.map(booking => (
          <li key={booking._id}>{booking.service} - {booking.date}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📤 2. INSERT DATA (POST)

### 2.1 Create Appointment
```jsx
import { receptionService } from '../services/receptionService';
import { useState } from 'react';

export default function CreateAppointment() {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await receptionService.createAppointment(formData);
      console.log('Appointment created:', response);
      setSuccess(true);
      
      // Reset form
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        service: '',
        notes: ''
      });
      
      // Show success message for 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating appointment:', err);
      alert('Failed to create appointment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>New Appointment</h2>
      
      {success && <p style={{ color: 'green' }}>✅ Appointment created successfully!</p>}

      <input
        type="text"
        name="customerName"
        placeholder="Customer Name"
        value={formData.customerName}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />

      <input
        type="time"
        name="time"
        value={formData.time}
        onChange={handleChange}
        required
      />

      <select
        name="service"
        value={formData.service}
        onChange={handleChange}
        required
      >
        <option value="">Select Service</option>
        <option value="Haircut">Haircut</option>
        <option value="Hair Color">Hair Color</option>
        <option value="Massage">Massage</option>
        <option value="Facial">Facial</option>
        <option value="Pedicure">Pedicure</option>
      </select>

      <textarea
        name="notes"
        placeholder="Additional Notes"
        value={formData.notes}
        onChange={handleChange}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Appointment'}
      </button>
    </form>
  );
}
```

### 2.2 Create Booking with File Upload
```jsx
import * as bookingService from '../services/bookingService';
import { useState } from 'react';

export default function CreateBooking() {
  const [formData, setFormData] = useState({
    customerName: '',
    service: '',
    amount: '',
    image: null
  });
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData for multipart upload
      const uploadData = new FormData();
      uploadData.append('customerName', formData.customerName);
      uploadData.append('service', formData.service);
      uploadData.append('amount', formData.amount);
      if (formData.image) {
        uploadData.append('image', formData.image);
      }

      const response = await bookingService.createBooking(uploadData);
      console.log('Booking created:', response);
      alert('Booking created successfully!');
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Failed to create booking');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>New Booking</h2>

      <input
        type="text"
        placeholder="Customer Name"
        value={formData.customerName}
        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
        required
      />

      <input
        type="text"
        placeholder="Service"
        value={formData.service}
        onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
        required
      />

      <input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
        required
      />

      <div>
        <label>Upload Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {preview && <img src={preview} alt="Preview" style={{ width: '100px', marginTop: '10px' }} />}
      </div>

      <button type="submit">Create Booking</button>
    </form>
  );
}
```

---

## ✏️ 3. UPDATE DATA (PUT/PATCH)

### 3.1 Update Appointment
```jsx
import { receptionService } from '../services/receptionService';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function EditAppointment() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    customerName: '',
    date: '',
    time: '',
    service: '',
    status: 'Scheduled'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const data = await receptionService.getAppointmentById(id);
        setFormData(data);
      } catch (err) {
        console.error('Error fetching appointment:', err);
      }
    };

    if (id) fetchAppointment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await receptionService.updateAppointment(id, formData);
      console.log('Appointment updated:', response);
      alert('Appointment updated successfully!');
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Appointment</h2>

      <input
        type="text"
        name="customerName"
        value={formData.customerName}
        onChange={handleChange}
        placeholder="Customer Name"
        required
      />

      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />

      <input
        type="time"
        name="time"
        value={formData.time}
        onChange={handleChange}
        required
      />

      <select name="service" value={formData.service} onChange={handleChange} required>
        <option value="Haircut">Haircut</option>
        <option value="Hair Color">Hair Color</option>
        <option value="Massage">Massage</option>
      </select>

      <select name="status" value={formData.status} onChange={handleChange}>
        <option value="Scheduled">Scheduled</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Appointment'}
      </button>
    </form>
  );
}
```

### 3.2 Update Payment Status
```jsx
import * as bookingService from '../services/bookingService';
import { useState } from 'react';

export default function UpdateBookingStatus({ bookingId, currentStatus }) {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);
      let response;
      
      if (newStatus === 'paid') {
        response = await bookingService.markPaid(bookingId);
      } else if (newStatus === 'pending') {
        response = await bookingService.markPending(bookingId);
      } else if (newStatus === 'ready') {
        response = await bookingService.markReady(bookingId);
      } else if (newStatus === 'complete') {
        response = await bookingService.markComplete(bookingId);
      }
      
      console.log('Status updated:', response);
      alert('Status updated successfully!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>Current Status: <strong>{currentStatus}</strong></p>
      <button onClick={() => updateStatus('paid')} disabled={loading}>Mark as Paid</button>
      <button onClick={() => updateStatus('ready')} disabled={loading}>Mark as Ready</button>
      <button onClick={() => updateStatus('complete')} disabled={loading}>Mark as Complete</button>
    </div>
  );
}
```

---

## 🗑️ 4. DELETE DATA (DELETE)

### 4.1 Delete Appointment
```jsx
import { receptionService } from '../services/receptionService';
import { useState } from 'react';

export default function DeleteAppointment({ appointmentId, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      setLoading(true);
      await receptionService.deleteAppointment(appointmentId);
      console.log('Appointment deleted');
      alert('Appointment deleted successfully!');
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert('Failed to delete appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      style={{ backgroundColor: 'red', color: 'white' }}
    >
      {loading ? 'Deleting...' : 'Delete Appointment'}
    </button>
  );
}
```

### 4.2 Delete Booking
```jsx
import * as bookingService from '../services/bookingService';
import { useState } from 'react';

export default function DeleteBooking({ bookingId, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this booking? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await bookingService.deleteBooking(bookingId);
      alert('Booking deleted!');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-danger">
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

---

## 📁 5. FILE UPLOAD

### 5.1 Image Upload to Backend
```jsx
import { useState } from 'react';
import api from '../services/api';

export default function ImageUpload({ appointmentId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('appointmentId', appointmentId);

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Upload successful:', response.data);
      alert('Image uploaded successfully!');
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h3>Upload Image</h3>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileSelect}
      />
      {preview && (
        <img 
          src={preview} 
          alt="Preview" 
          style={{ width: '150px', marginTop: '10px' }}
        />
      )}
      <button 
        onClick={handleUpload} 
        disabled={uploading || !file}
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
}
```

### 5.2 Multiple File Upload
```jsx
import { useState } from 'react';
import api from '../services/api';

export default function MultiFileUpload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFilesSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select files');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      // Append all files
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await api.post('/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Upload successful:', response.data);
      alert(`${files.length} files uploaded successfully!`);
      setFiles([]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h3>Upload Multiple Files</h3>
      <input 
        type="file" 
        multiple
        accept="image/*"
        onChange={handleFilesSelect}
      />
      <p>{files.length} files selected</p>
      <button 
        onClick={handleUpload} 
        disabled={uploading || files.length === 0}
      >
        {uploading ? 'Uploading...' : `Upload ${files.length} Files`}
      </button>
    </div>
  );
}
```

---

## 🔄 6. ADVANCED PATTERNS

### 6.1 Real-time Data Synchronization
```jsx
import { useState, useEffect } from 'react';
import { receptionService } from '../services/receptionService';

export default function LiveAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      try {
        const data = await receptionService.getAllAppointments();
        setAppointments(data);
      } catch (err) {
        console.error('Error fetching:', err);
      }
    };

    fetchData();

    // Refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Live Appointments ({appointments.length})</h2>
      {appointments.map(apt => (
        <div key={apt._id}>
          <p>{apt.customerName} - {apt.date}</p>
        </div>
      ))}
    </div>
  );
}
```

### 6.2 Error Handling & Retry
```jsx
import { useState } from 'react';

export default function DataFetcher({ fetchFn }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 3;

  const handleFetch = async () => {
    try {
      setError(null);
      const result = await fetchFn();
      setData(result);
      setRetries(0);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);

      if (retries < MAX_RETRIES) {
        // Retry after 2 seconds
        setTimeout(() => {
          setRetries(prev => prev + 1);
          handleFetch();
        }, 2000);
      }
    }
  };

  return (
    <div>
      <button onClick={handleFetch}>Fetch Data</button>
      {error && <p style={{ color: 'red' }}>Error: {error} (Retry {retries}/{MAX_RETRIES})</p>}
      {data && <p>Data loaded successfully!</p>}
    </div>
  );
}
```

### 6.3 Batch Operations
```jsx
import { receptionService } from '../services/receptionService';
import { useState } from 'react';

export default function BatchDelete({ appointmentIds }) {
  const [loading, setLoading] = useState(false);

  const handleBatchDelete = async () => {
    if (!window.confirm(`Delete ${appointmentIds.length} appointments?`)) {
      return;
    }

    try {
      setLoading(true);
      const results = await Promise.allSettled(
        appointmentIds.map(id => receptionService.deleteAppointment(id))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      alert(`Deleted ${successful}/${appointmentIds.length} appointments`);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleBatchDelete} disabled={loading}>
      {loading ? 'Deleting...' : `Delete ${appointmentIds.length} Items`}
    </button>
  );
}
```

---

## 📚 7. CUSTOM HOOKS

### 7.1 useFetch Hook
```jsx
import { useState, useEffect } from 'react';

export function useFetch(fetchFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
}

// Usage:
export default function App() {
  const { data: appointments, loading, error } = useFetch(
    () => receptionService.getAllAppointments()
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return appointments.map(apt => <div key={apt._id}>{apt.customerName}</div>);
}
```

### 7.2 useForm Hook
```jsx
import { useState, useCallback } from 'react';

export function useForm(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onSubmit(values);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [values, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return { values, handleChange, handleSubmit, reset, loading, error };
}

// Usage:
export default function CreateForm() {
  const { values, handleChange, handleSubmit, loading, error } = useForm(
    { name: '', date: '' },
    async (data) => {
      await receptionService.createAppointment(data);
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={values.name} onChange={handleChange} />
      <input name="date" type="date" value={values.date} onChange={handleChange} />
      <button disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

---

## 🎯 Summary

### Common Operations:

```javascript
// GET
receptionService.getAllAppointments()
receptionService.getAppointmentById(id)

// POST
receptionService.createAppointment(data)
bookingService.createBooking(formData)

// PUT
receptionService.updateAppointment(id, data)

// DELETE
receptionService.deleteAppointment(id)
bookingService.deleteBooking(id)

// PATCH (Status Updates)
bookingService.markPaid(id)
bookingService.markReady(id)
bookingService.markComplete(id)
```

### Error Handling:
- Use try-catch blocks
- Display user-friendly messages
- Show loading states
- Implement retry logic for failed requests

### Best Practices:
- ✅ Always use async/await
- ✅ Handle loading and error states
- ✅ Validate form data before submission
- ✅ Use custom hooks for reusable logic
- ✅ Implement proper error messages
- ✅ Use FormData for file uploads
- ✅ Add confirmation dialogs for deletions

---

**🚀 Ready to build!** Copy any pattern and adapt it to your needs.
