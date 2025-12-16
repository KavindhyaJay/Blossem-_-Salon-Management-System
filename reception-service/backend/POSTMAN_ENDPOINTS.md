# Reception Module - Postman API Endpoints

**Base URL:** `http://localhost:8081`

---

## 📋 Reception Appointments Endpoints

### 1. Get All Reception Appointments
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/reception_appointments`
- **Headers:** None required
- **Body:** None
- **Response:** List of all reception appointments

### 2. Get Reception Appointment by ID
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/reception_appointments/{id}`
- **Example:** `http://localhost:8081/api/reception_appointments/693c22538a4cd57796664197`
- **Headers:** None required
- **Body:** None
- **Response:** Single reception appointment object

### 3. Create New Reception Appointment
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/reception_appointments`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "email": "ridmi@gmail.com",
    "customerName": "Ridmi",
    "services": ["Hair cut", "Hair Color"],
    "date": "2025-12-16",
    "time": "4:00 PM",
    "staff": "Thinuri",
    "amount": "2000",
    "payment": "Paid",
    "customerArrived": "No",
    "receptionPaymentChecked": "No",
    "receptionNotes": "Customer prefers morning slot"
  }
  ```
- **Notes:**
  - `email` is **required** (used to fetch customer name from customer collection)
  - `date` and `time` are **required**
  - `bookingId` is optional (if omitted, creates a booking first)
  - This will create entries in both `bookings` and `reception_appointments` collections

### 4. Create Reception Appointment from Existing Booking
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/reception_appointments/from-booking/{bookingId}`
- **Example:** `http://localhost:8081/api/reception_appointments/from-booking/693c22538a4cd57796664197`
- **Headers:** None required
- **Body:** None
- **Response:** Created reception appointment from existing booking

### 5. Update Reception Appointment
- **Method:** `PUT`
- **URL:** `http://localhost:8081/api/reception_appointments/{id}`
- **Example:** `http://localhost:8081/api/reception_appointments/693c22538a4cd57796664197`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "email": "ridmi@gmail.com",
    "services": ["Hair cut", "Hair Color", "Hair Treatment"],
    "date": "2025-12-16",
    "time": "5:00 PM",
    "staff": "Thinuri",
    "payment": "Paid",
    "customerArrived": "Yes",
    "receptionPaymentChecked": "Yes",
    "receptionNotes": "Updated appointment time"
  }
  ```
- **Notes:** Updates both `bookings` and `reception_appointments` collections

### 6. Mark Customer as Arrived (by Reception Appointment ID)
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/reception_appointments/{id}/arrived`
- **Example:** `http://localhost:8081/api/reception_appointments/693c22538a4cd57796664197/arrived`
- **Query Parameters:**
  - `staffEmail` (optional): Email address to send notification to staff
    - Example: `?staffEmail=thinuri@salon.com`
- **Full Example:** `http://localhost:8081/api/reception_appointments/693c22538a4cd57796664197/arrived?staffEmail=thinuri@salon.com`
- **Headers:** None required
- **Body:** None
- **Response:** Updated reception appointment with `customerArrived: "Yes"`
- **Notes:** 
  - Sets `customerArrived` to "Yes"
  - Sends email notification to staff if `staffEmail` is provided
  - Updates both collections

### 7. Mark Customer as Arrived (by Booking ID)
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/reception_appointments/booking/{bookingId}/arrived`
- **Example:** `http://localhost:8081/api/reception_appointments/booking/693c22538a4cd57796664197/arrived`
- **Query Parameters:**
  - `staffEmail` (optional): Email address to send notification to staff
    - Example: `?staffEmail=thinuri@salon.com`
- **Full Example:** `http://localhost:8081/api/reception_appointments/booking/693c22538a4cd57796664197/arrived?staffEmail=thinuri@salon.com`
- **Headers:** None required
- **Body:** None
- **Response:** Updated reception appointment

### 8. Update Payment Check Status
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/reception_appointments/{id}/payment-check`
- **Example:** `http://localhost:8081/api/reception_appointments/693c22538a4cd57796664197/payment-check`
- **Query Parameters:**
  - `paymentChecked` (required): "Yes" or "No"
    - Example: `?paymentChecked=Yes`
- **Full Example:** `http://localhost:8081/api/reception_appointments/693c22538a4cd57796664197/payment-check?paymentChecked=Yes`
- **Headers:** None required
- **Body:** None
- **Response:** Updated reception appointment
- **Notes:** Updates `receptionPaymentChecked` field and syncs with booking collection

### 9. Update Payment Status (by Booking ID)
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/reception_appointments/booking/{bookingId}/payment`
- **Example:** `http://localhost:8081/api/reception_appointments/booking/693c22538a4cd57796664197/payment`
- **Query Parameters:**
  - `status` (required): `PAID` or `PENDING`
    - Example: `?status=PAID`
- **Full Example:** `http://localhost:8081/api/reception_appointments/booking/693c22538a4cd57796664197/payment?status=PAID`
- **Headers:** None required
- **Body:** None
- **Response:** Updated reception appointment

### 10. Delete Reception Appointment
- **Method:** `DELETE`
- **URL:** `http://localhost:8081/api/reception_appointments/{id}`
- **Example:** `http://localhost:8081/api/reception_appointments/693c22538a4cd57796664197`
- **Headers:** None required
- **Body:** None
- **Response:** 200 OK (no body)
- **Notes:** Deletes from both `bookings` and `reception_appointments` collections

---

## 📋 Booking Endpoints (Additional)

### 11. Get All Bookings
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/bookings`
- **Headers:** None required
- **Body:** None
- **Response:** List of all bookings

### 12. Get Booking by ID
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/bookings/{id}`
- **Example:** `http://localhost:8081/api/bookings/693c22538a4cd57796664197`
- **Headers:** None required
- **Body:** None
- **Response:** Single booking object

### 13. Create Booking
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/bookings`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "customerName": "Ridmi",
    "services": ["Hair cut", "Hair Color"],
    "date": "2025-12-16",
    "time": "4:00 PM",
    "staff": "Thinuri",
    "payment": "2000"
  }
  ```

### 14. Update Booking
- **Method:** `PUT`
- **URL:** `http://localhost:8081/api/bookings/{id}`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):** Same as create booking

### 15. Delete Booking
- **Method:** `DELETE`
- **URL:** `http://localhost:8081/api/bookings/{id}`
- **Headers:** None required
- **Body:** None

---

## 📝 Example Request Bodies

### Complete Reception Appointment Request
```json
{
  "email": "ridmi@gmail.com",
  "customerName": "Ridmi",
  "services": ["Hair cut", "Hair Color"],
  "date": "2025-12-16",
  "time": "4:00 PM",
  "staff": "Thinuri",
  "amount": "2000",
  "payment": "Paid",
  "customerArrived": "No",
  "receptionPaymentChecked": "No",
  "receptionNotes": "First time customer"
}
```

### Minimal Reception Appointment Request (Required fields only)
```json
{
  "email": "ridmi@gmail.com",
  "date": "2025-12-16",
  "time": "4:00 PM"
}
```

### Update Reception Appointment Request
```json
{
  "email": "ridmi@gmail.com",
  "services": ["Hair cut", "Hair Color", "Hair Treatment"],
  "date": "2025-12-17",
  "time": "3:00 PM",
  "staff": "Thinuri",
  "payment": "Paid",
  "customerArrived": "Yes",
  "receptionPaymentChecked": "Yes"
}
```

---

## 🔔 Email Notification

When marking a customer as arrived with `staffEmail` parameter, the system sends an email containing:
- Customer name
- Customer email
- Services
- Date
- Time

Example email endpoint call:
```
POST http://localhost:8081/api/reception_appointments/693c22538a4cd57796664197/arrived?staffEmail=thinuri@salon.com
```

---

## ⚠️ Important Notes

1. **Email Field**: The `email` field in reception appointments is used to fetch customer name from the `customers` collection. Ensure the customer exists in the customers collection.

2. **Synchronization**: Updates to reception appointments automatically sync with the bookings collection when a `bookingId` exists.

3. **Customer Arrival**: Setting `customerArrived` to "Yes" will update the booking status to `CUSTOMER_ARRIVED`.

4. **Payment Check**: Setting `receptionPaymentChecked` to "Yes" will update the booking payment status to `PAID`.

5. **Deletion**: Deleting a reception appointment will also delete the associated booking.

6. **CORS**: All endpoints have CORS enabled for frontend integration.

---

## 🧪 Testing Checklist

- [ ] Create a new reception appointment
- [ ] Get all reception appointments
- [ ] Get reception appointment by ID
- [ ] Update reception appointment
- [ ] Mark customer as arrived
- [ ] Update payment check status
- [ ] Delete reception appointment
- [ ] Test email notification (mark arrived with staffEmail)
- [ ] Test creating from existing booking

---

**Server Port:** 8081  
**Base Path:** `/api/reception_appointments` or `/api/bookings`

