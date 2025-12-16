# Reception Module Frontend

A modern React frontend for the Salon Reception Management System with a beautiful green color scheme.

## Features

- ✅ Add New Appointments
- ✅ Edit Appointments
- ✅ Delete Appointments
- ✅ Mark Customer Arrived (with email notification)
- ✅ Update Payment Check Status
- ✅ View All Appointments
- ✅ Real-time Statistics
- ✅ Responsive Design
- ✅ Green Color Theme

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. The app will run on `http://localhost:3000`

## API Configuration

Make sure your backend is running on `http://localhost:8081` (configured in `src/services/api.js`)

## Color Scheme

The application uses a beautiful green color palette:
- Primary Green: `#10b981`
- Primary Green Dark: `#059669`
- Secondary Green: `#065f46`
- Light Background: `#f0fdf4`

## Components

- **ReceptionDashboard**: Main dashboard with appointment list and statistics
- **AppointmentTable**: Table displaying all appointments with actions
- **AppointmentModal**: Modal for adding/editing appointments
- **Header**: Application header with branding and add button

## Usage

1. Click "Add Appointment" to create a new appointment
2. Fill in the email (required) - customer name will be fetched automatically
3. Fill in services, date, time, staff, and payment details
4. Use the dropdowns in the table to mark customer arrived or update payment check
5. Click edit/delete buttons to manage appointments

