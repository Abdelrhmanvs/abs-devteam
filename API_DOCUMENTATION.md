# HR Request Management System - API Documentation

## Overview

This document describes the complete backend-first architecture for the HR Request Management System, including all API endpoints, data models, and frontend integration patterns.

---

## Backend Architecture

### Data Models

#### 1. User Model (`models/User.js`)

Enhanced user model with employee fields:

**Core Fields:**

- `username` (required, unique) - User's login username
- `password` (required) - Hashed password with bcrypt
- `email` (unique sparse) - Employee email address
- `roles` (default: ["user"]) - User roles array
- `active` (default: true) - Account status

**Employee Fields:**

- `fullName` (required if employeeCode exists) - Full employee name
- `employeeCode` (unique sparse) - Unique employee identifier
- `fingerprintCode` (unique sparse) - Fingerprint system identifier
- `jobPosition` - Employee job title
- `branch` (default: "Maadi") - Office branch location

**Indexes:** employeeCode, email, fingerprintCode

---

#### 2. Request Model (`models/Request.js`)

HR request model for WFH and Mission requests:

**Fields:**

- `employeeId` (required, ref: User) - Employee who made the request
- `employeeName` (required) - Denormalized employee name for quick access
- `employeeCode` (required) - Denormalized employee code
- `type` (required, enum: ["WFH", "Mission"]) - Request type
- `startDate` (required, Date) - Request start date
- `endDate` (required, Date) - Request end date
- `selectedDates` (Array of Dates) - Individual dates selected
- `numberOfDays` (required, Number, min: 1) - Total days requested
- `reason` (String) - Request reason/purpose
- `notes` (String) - Additional notes
- `status` (enum: ["Pending", "Approved", "Rejected"], default: "Pending") - Request status
- `createdAt`, `updatedAt` (timestamps: true) - Auto-generated timestamps

**Indexes:**

- Compound: (employeeId, createdAt)
- Single: status
- Compound: (startDate, endDate)

---

## API Endpoints

### 1. Employee Management

#### POST `/users/employee`

**Description:** Create new employee account  
**Access:** Admin only (verifyJwt required)  
**Request Body:**

```json
{
  "username": "string (required)",
  "password": "string (required, min 6 chars)",
  "email": "string (required, valid email)",
  "fullName": "string (required)",
  "employeeCode": "string (required)",
  "fingerprintCode": "string (required)",
  "jobPosition": "string (required)",
  "branch": "string (default: Maadi)",
  "phoneNumber": "string (optional)",
  "roles": "array (default: ['user'])"
}
```

**Response (201):**

```json
{
  "message": "Employee created successfully",
  "employee": {
    "_id": "string",
    "username": "string",
    "fullName": "string",
    "employeeCode": "string",
    "fingerprintCode": "string",
    "jobPosition": "string",
    "branch": "string",
    "email": "string"
  }
}
```

**Error Responses:**

- 400: Missing required fields, invalid email format, password too short
- 409: Duplicate email, employeeCode, or fingerprintCode

---

#### GET `/users`

**Description:** Get all users/employees  
**Access:** Admin only (verifyJwt required)  
**Response (200):**

```json
[
  {
    "_id": "string",
    "username": "string",
    "fullName": "string",
    "employeeCode": "string",
    "email": "string",
    "jobPosition": "string",
    "branch": "string"
  }
]
```

---

### 2. Request Management

#### POST `/requests`

**Description:** Create new WFH or Mission request  
**Access:** Private (authenticated users)  
**Request Body:**

```json
{
  "type": "WFH | Mission (required)",
  "startDate": "YYYY-MM-DD (required)",
  "endDate": "YYYY-MM-DD (required)",
  "selectedDates": ["YYYY-MM-DD", ...] (optional array),
  "numberOfDays": "number (required, min 1)",
  "notes": "string (optional)"
}
```

**Response (201):**

```json
{
  "message": "Request created successfully",
  "request": {
    "_id": "string",
    "employeeName": "string",
    "employeeCode": "string",
    "type": "WFH | Mission",
    "startDate": "ISO date",
    "endDate": "ISO date",
    "numberOfDays": "number",
    "status": "Pending",
    "createdAt": "ISO date"
  }
}
```

**Error Responses:**

- 400: Missing required fields
- 404: User not found

**Notes:**

- Employee info automatically extracted from JWT token
- Status automatically set to "Pending"
- employeeName and employeeCode denormalized from User model

---

#### GET `/requests/my`

**Description:** Get logged-in user's requests  
**Access:** Private (authenticated users)  
**Query Parameters:**

- `limit` (optional, number) - Limit number of results (default: all)

**Response (200):**

```json
[
  {
    "_id": "string",
    "type": "WFH | Mission",
    "startDate": "ISO date",
    "endDate": "ISO date",
    "numberOfDays": "number",
    "status": "Pending | Approved | Rejected",
    "notes": "string",
    "createdAt": "ISO date"
  }
]
```

**Usage Example:**

- Dashboard Recent Requests: `GET /requests/my?limit=5`
- Requests Page: `GET /requests/my`

---

#### GET `/requests/week`

**Description:** Get current week schedule (approved WFH requests)  
**Access:** Private (authenticated users)  
**Response (200):**

```json
[
  {
    "date": "YYYY-MM-DD",
    "status": "WFH",
    "type": "WFH"
  }
]
```

**Notes:**

- Calculates current week: Sunday 00:00 to Saturday 23:59
- Only returns approved WFH requests
- Expands date ranges into individual dates
- Includes selectedDates array entries

**Week Calculation Logic:**

```javascript
const today = new Date();
const dayOfWeek = today.getDay(); // 0 = Sunday
const weekStart = new Date(today);
weekStart.setDate(today.getDate() - dayOfWeek);
weekStart.setHours(0, 0, 0, 0);

const weekEnd = new Date(weekStart);
weekEnd.setDate(weekStart.getDate() + 6);
weekEnd.setHours(23, 59, 59, 999);
```

---

#### GET `/requests`

**Description:** Get all requests (admin only)  
**Access:** Admin only  
**Response (200):**

```json
[
  {
    "_id": "string",
    "employeeId": {
      "_id": "string",
      "fullName": "string",
      "employeeCode": "string"
    },
    "type": "WFH | Mission",
    "startDate": "ISO date",
    "endDate": "ISO date",
    "numberOfDays": "number",
    "status": "Pending | Approved | Rejected",
    "createdAt": "ISO date"
  }
]
```

**Notes:**

- Populates employeeId with full user details
- Sorted by createdAt descending (newest first)

---

#### GET `/requests/approved`

**Description:** Get approved requests in HR form format  
**Access:** Admin only  
**Response (200):**

```json
[
  {
    "id": "string",
    "code": "string",
    "Employee / Fingerprint": "string",
    "Employee": "string",
    "Employee / Job Position": "string",
    "Employee / الفرع": "string",
    "Time Off Type": "WFH | Mission",
    "الغرض من النموذج الإداري": "string",
    "Start Date": "YYYY-MM-DD",
    "End Date": "YYYY-MM-DD",
    "عدد الأيام": "number"
  }
]
```

**Notes:**

- Returns data with exact column names for Excel export
- Column names match HR form requirements (mixed English/Arabic)
- Includes employee details from populated User reference
- Only returns requests with status "Approved"

**Column Mapping:**

- code → employeeCode
- Employee / Fingerprint → fingerprintCode
- Employee → fullName
- Employee / Job Position → jobPosition
- Employee / الفرع → branch
- Time Off Type → type
- الغرض من النموذج الإداري → notes/reason
- Start Date → startDate (formatted)
- End Date → endDate (formatted)
- عدد الأيام → numberOfDays

---

#### PATCH `/requests/:id`

**Description:** Update request status (approve/reject)  
**Access:** Admin only  
**Request Body:**

```json
{
  "status": "Approved | Rejected (required)"
}
```

**Response (200):**

```json
{
  "message": "Request updated successfully",
  "request": {
    "_id": "string",
    "status": "Approved | Rejected",
    "updatedAt": "ISO date"
  }
}
```

**Error Responses:**

- 400: Invalid status value
- 404: Request not found

---

## Frontend Integration

### Authentication

All private API calls use `useAxiosPrivate` hook which:

- Automatically includes JWT access token in headers
- Handles token refresh on 403 responses
- Maintains authentication state

**Usage:**

```javascript
const axiosPrivate = useAxiosPrivate();
const response = await axiosPrivate.get("/requests/my");
```

---

### Page Integrations

#### 1. Dashboard Component

**File:** `frontend/src/components/Dashboard.js`

**API Calls:**

1. **Create New Request Modal:**

   - Endpoint: `POST /requests`
   - Trigger: Form submission
   - Data: `{ type, startDate, endDate, numberOfDays, notes }`
   - Success: Navigate to `/requests`
   - Loading state: Button shows "Submitting..." and disabled

2. **Recent Requests:**

   - Endpoint: `GET /requests/my?limit=5`
   - Trigger: Component mount
   - Data mapping: `_id → id`, format createdAt with toLocaleDateString()

3. **My Schedule (Week View):**
   - Endpoint: `GET /requests/week`
   - Trigger: Component mount
   - Displays: Current week (Sunday-Saturday) with WFH status

**State Management:**

```javascript
const [recentRequests, setRecentRequests] = useState([]);
const [weekSchedule, setWeekSchedule] = useState([]);
const [loading, setLoading] = useState(false);
```

---

#### 2. Requests Component

**File:** `frontend/src/components/Requests.js`

**API Calls:**

1. **Fetch All Requests:**

   - Endpoint: `GET /requests/my`
   - Trigger: Component mount
   - Data mapping: Format dates with toLocaleDateString()
   - Loading state: Shows "Loading requests..."
   - Empty state: Shows "No requests found"

2. **Create New Request Modal:**

   - Endpoint: `POST /requests`
   - Trigger: Form submission
   - Data: Same as Dashboard
   - Success: Refresh requests list (no navigation)
   - Loading state: Button disabled with "Submitting..."

3. **Approve Request:**

   - Endpoint: `PATCH /requests/:id`
   - Trigger: Approve button click
   - Body: `{ status: "Approved" }`
   - Success: Refresh requests list
   - Error: Show alert with error message

4. **Reject Request:**
   - Endpoint: `PATCH /requests/:id`
   - Trigger: Reject button click
   - Body: `{ status: "Rejected" }`
   - Success: Refresh requests list
   - Error: Show alert with error message

**Table Columns:**

- Request Type (type)
- Date Range (startDate - endDate)
- Days (numberOfDays)
- Status (badge with color coding)
- Actions (Approve/Reject buttons, only for Pending status)

**Status Colors:**

- Approved: #10b981 (green)
- Pending: #f59e0b (amber)
- Rejected: #ef4444 (red)

---

#### 3. HRForm Component

**File:** `frontend/src/components/HRForm.js`

**API Calls:**

1. **Fetch Approved Requests:**
   - Endpoint: `GET /requests/approved`
   - Trigger: Component mount
   - Data: Pre-formatted with exact column names
   - No transformation needed

**Features:**

- Editable table cells (click to edit)
- Filter by request type dropdown
- Filter by date
- Export to Excel with formatted columns
- Auto-calculate numberOfDays when dates change

**Excel Export:**

- Filename: `HR_Export_YYYY-MM-DD.xlsx`
- Sheet name: "HR Export"
- Auto-sized columns
- Exact column names preserved

---

#### 4. AddFromHome Component

**File:** `frontend/src/components/AddFromHome.js`

**API Calls:**

1. **Fetch Employees (for dropdown):**

   - Endpoint: `GET /users`
   - Trigger: Component mount
   - Used for: Searchable employee dropdown
   - Fallback: Sample data on error

2. **Submit WFH Request:**
   - Endpoint: `POST /requests`
   - Trigger: Form submission
   - Data:
     ```javascript
     {
       type: "WFH",
       startDate: validDates[0],
       endDate: validDates[validDates.length - 1],
       selectedDates: validDates,
       numberOfDays: validDates.length,
       notes: reason
     }
     ```
   - Success: Show success message, reset form after 2s
   - Loading state: Button shows "Submitting..."

**Features:**

- Searchable employee dropdown (filter by name or code)
- Click outside to close dropdown
- Multiple date selection
- Current week restriction (Sunday-Saturday)
- Validation: At least one date required

**Date Range Logic:**

```javascript
const getCurrentWeekRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  return {
    min: sunday.toISOString().split("T")[0],
    max: saturday.toISOString().split("T")[0],
  };
};
```

---

#### 5. AddEmployee Component

**File:** `frontend/src/components/AddEmployee.js`

**API Calls:**

1. **Create Employee:**
   - Endpoint: `POST /users/employee`
   - Trigger: Form submission
   - Data transformation: `fingerprint → fingerprintCode`
   - Success: Show success message, reset form after 2s
   - Error: Show specific backend validation errors

**Form Fields:**

- Full Name (required)
- Email (required, email validation)
- Phone Number (optional)
- Password (required, min 6 characters)
- Employee Code (required)
- Fingerprint (required)
- Job Position (dropdown)
- Branch (dropdown, default: Maadi)

**Validation:**

- Email format: regex pattern
- Password length: minimum 6 characters
- All required fields: not empty
- Fingerprint code: required

---

## Error Handling

### Backend Error Responses

All endpoints follow consistent error format:

```json
{
  "message": "Error description"
}
```

### Frontend Error Handling Pattern

```javascript
try {
  // API call
  const response = await axiosPrivate.post("/endpoint", data);
  // Success handling
} catch (error) {
  console.error("Error description:", error);
  alert(error.response?.data?.message || "Default error message");
} finally {
  setLoading(false);
}
```

---

## Loading States

All form submissions implement loading states:

1. Set `loading = true` before API call
2. Disable submit button
3. Change cursor to "not-allowed"
4. Change button text to "Submitting..."
5. Prevent hover effects when loading
6. Set `loading = false` in finally block

**Example:**

```javascript
<button
  type="submit"
  disabled={loading}
  style={{
    background: loading ? "#9ca3af" : "#f97316",
    cursor: loading ? "not-allowed" : "pointer",
  }}
  onMouseEnter={(e) => {
    if (!loading) e.target.style.background = "#ea580c";
  }}
  onMouseLeave={(e) => {
    if (!loading) e.target.style.background = "#f97316";
  }}
>
  {loading ? "Submitting..." : "Submit Request"}
</button>
```

---

## Date Formatting

### Backend

- Store dates as Date objects
- Accept ISO string format: `YYYY-MM-DD`
- Return ISO string format

### Frontend

- Input format: `YYYY-MM-DD` (HTML date input)
- Display format: `toLocaleDateString()` (e.g., "10/15/2023")
- Calculation:
  ```javascript
  const numberOfDays =
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  ```

---

## Security

### Authentication Flow

1. User logs in: `POST /auth` → receives accessToken (cookie) and refreshToken (cookie)
2. Frontend stores accessToken in memory (auth context)
3. Every private request includes token via axiosPrivate
4. Backend verifyJwt middleware validates token
5. JWT payload contains: username, roles
6. Token refresh handled automatically by axios interceptor

### Authorization

- **Public routes:** `/auth` (login/register)
- **User routes:** `/requests/*` (authenticated users)
- **Admin routes:** `/users/employee`, `/requests/approved`, `PATCH /requests/:id`

### Middleware Stack

```javascript
router
  .route("/endpoint")
  .all(verifyJwt) // Authentication
  .get(controller.method); // Authorization checked in controller
```

---

## Database Indexes

### User Model

- `username` (unique)
- `email` (unique sparse)
- `employeeCode` (unique sparse)
- `fingerprintCode` (unique sparse)

### Request Model

- `{ employeeId: 1, createdAt: -1 }` (compound)
- `status` (single)
- `{ startDate: 1, endDate: 1 }` (compound)

**Query Patterns:**

- Find user's requests: `{ employeeId, createdAt: -1 }`
- Find pending requests: `{ status: "Pending" }`
- Find requests in date range: `{ startDate: { $lte }, endDate: { $gte } }`

---

## Testing Checklist

### Backend Tests

- [ ] Create employee with all fields
- [ ] Create employee with duplicate email (should fail)
- [ ] Create request with valid data
- [ ] Create request without required fields (should fail)
- [ ] Get user's own requests
- [ ] Get current week schedule
- [ ] Approve request (admin only)
- [ ] Reject request (admin only)
- [ ] Get approved requests in HR format

### Frontend Tests

- [ ] Dashboard: Create new request → redirects to /requests
- [ ] Dashboard: Recent requests loads correctly
- [ ] Dashboard: Week schedule displays current week
- [ ] Requests: List loads with proper formatting
- [ ] Requests: Create request refreshes list
- [ ] Requests: Approve button updates status
- [ ] Requests: Reject button updates status
- [ ] HRForm: Approved requests load
- [ ] HRForm: Excel export works
- [ ] AddFromHome: Employee dropdown search
- [ ] AddFromHome: Submit WFH request
- [ ] AddEmployee: Create employee form

### Integration Tests

- [ ] Create request → appears in Requests page
- [ ] Approve request → appears in HRForm
- [ ] Create WFH request → appears in Dashboard week view
- [ ] Week boundary test: Requests spanning Sunday-Saturday

---

## Common Issues & Solutions

### Issue: "User not found" when creating request

**Cause:** JWT username doesn't match User.username in database  
**Solution:** Verify JWT payload contains correct username field

### Issue: Week schedule empty

**Cause:** No approved WFH requests for current week  
**Solution:** Check date ranges, ensure requests are approved, verify dayOfWeek calculation

### Issue: HRForm shows empty table

**Cause:** No approved requests in database  
**Solution:** Approve some requests first, check /requests/approved endpoint

### Issue: Employee dropdown not loading

**Cause:** /users endpoint requires admin role  
**Solution:** Either make /users public for employee list or create separate /users/list endpoint

### Issue: Token expired errors

**Cause:** Access token expired, refresh token not working  
**Solution:** Check axios interceptor implementation, verify refresh token is valid

---

## Future Enhancements

### Phase 2 Features

- [ ] Email notifications on request approval/rejection
- [ ] Request comments/history
- [ ] Bulk approve/reject
- [ ] Advanced filtering (by employee, date range, type)
- [ ] Request statistics dashboard
- [ ] Calendar view for requests
- [ ] Export individual request PDF
- [ ] Request withdrawal (cancel pending request)

### Phase 3 Features

- [ ] Multi-level approval workflow
- [ ] Leave balance tracking
- [ ] Public holidays management
- [ ] Team availability view
- [ ] Mobile app integration
- [ ] Slack/Teams notifications

---

## Conclusion

This documentation provides a complete overview of the HR Request Management System architecture. All backend APIs are designed following REST principles, with clear separation of concerns between authentication, authorization, and business logic. The frontend integrates seamlessly using React hooks and Axios for API communication, with consistent error handling and loading states across all components.

**Key Principles:**

1. Backend-first design: Complete backend before frontend
2. JWT authentication: Secure token-based auth
3. Data denormalization: employeeName, employeeCode stored in Request model
4. Consistent error handling: Standard format across all endpoints
5. Loading states: User feedback on all async operations
6. Date handling: ISO format for storage, localized for display
7. Week calculation: Sunday-Saturday standard

All components are now fully integrated with the backend API and ready for testing and deployment.
