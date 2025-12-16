# Frontend-Backend Connection Setup

## ✅ Connection Status: CONNECTED & RUNNING

### Backend Server
- **URL**: `http://localhost:8081`
- **Framework**: Spring Boot 3.2.5
- **Java Version**: 17
- **Database**: MongoDB Atlas (SalonDb)
- **Status**: ✅ Running
- **Start Command**: `mvn spring-boot:run`

### Frontend Server
- **URL**: `http://localhost:3000`
- **Framework**: React 18.2.0
- **Status**: ✅ Running and Compiled
- **Start Command**: `npm start`

### Configured APIs

#### 1. Reception Appointments API
- **Endpoint**: `http://localhost:8081/api/reception_appointments`
- **Frontend Service**: [src/services/receptionService.js](src/services/receptionService.js)
- **CORS**: Enabled via `@CrossOrigin` annotation
- **Methods**:
  - GET `/` - Get all appointments
  - GET `/{id}` - Get appointment by ID
  - POST `/` - Create new appointment
  - PUT `/{id}` - Update appointment
  - DELETE `/{id}` - Delete appointment

#### 2. Bookings API
- **Endpoint**: `http://localhost:8081/api/bookings`
- **Frontend Service**: [src/services/bookingService.js](src/services/bookingService.js)
- **CORS**: Enabled via `@CrossOrigin` annotation
- **Methods**:
  - GET `/` - Get all bookings
  - GET `/{id}` - Get booking by ID
  - POST `/` - Create new booking
  - PUT `/{id}` - Update booking
  - DELETE `/{id}` - Delete booking
  - PATCH `/{id}/paid` - Mark as paid
  - PATCH `/{id}/pending` - Mark as pending
  - PATCH `/{id}/ready` - Mark as ready
  - PATCH `/{id}/complete` - Mark as complete

### Network Configuration

#### API Base URL Configuration
- **File**: [frontend/src/services/api.js](frontend/src/services/api.js)
- **Base URL**: `http://localhost:8081/api/reception_appointments`
- **Proxy**: `http://localhost:8081` (configured in package.json for development)

#### CORS Configuration
- **Backend Controllers**: Both `ReceptionController` and `BookingController` have `@CrossOrigin` enabled
- **Allowed Origins**: All origins (default @CrossOrigin behavior)

#### Database Connection
- **URI**: `mongodb+srv://rivishkaps2025_db_user@salondb.aaywcoi.mongodb.net/SalonDb`
- **Status**: ✅ Connected to MongoDB Atlas

### Testing the Connection

1. **Test Backend Health**:
   ```bash
   curl http://localhost:8081/api/reception_appointments
   ```

2. **Test Frontend Access**:
   Open browser to `http://localhost:3000`

3. **Check Console Logs**:
   - Backend: Maven console will show requests
   - Frontend: Browser DevTools Network tab will show API calls

### Troubleshooting

If connection fails:

1. **Verify Backend is Running**:
   ```bash
   cd reception-service/backend
   mvn spring-boot:run
   ```

2. **Verify Frontend is Running**:
   ```bash
   cd reception-service/frontend
   npm start
   ```

3. **Check MongoDB Connection**:
   - Verify internet connection
   - Check MongoDB Atlas credentials in [application.properties](backend/src/main/resources/application.properties)

4. **Check CORS Issues**:
   - Browser console should not show CORS errors
   - If errors appear, CORS is properly configured on backend

### Important Files Modified

1. **package.json** - Added proxy configuration for development
   ```json
   "proxy": "http://localhost:8081"
   ```

### Environment Details

- **OS**: Windows 11
- **Java**: JDK 17.0.10
- **Node.js**: Latest (used for React)
- **Maven**: v3.11.0
- **Spring Boot**: 3.2.5

---

**Setup completed on**: December 16, 2025
