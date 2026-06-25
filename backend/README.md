# Nagar Darpan - Problem Reporting & Tracking System
## REST API Backend

This is a comprehensive REST API for a problem reporting and tracking system built with **Node.js, Express.js, and MongoDB**.

**Student ID:** 22301396  
**Server Port:** 1396  
**Database:** MongoDB

---

## 🚀 Quick Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (running locally or on a server)

### Installation Steps

1. **Navigate to the backend folder:**
   ```bash
   cd d:\NagarDarpan\backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start MongoDB:**
   - If using MongoDB locally:
     ```bash
     mongod
     ```
   - Or use MongoDB Atlas (cloud) - update `.env` file with your connection string

4. **Seed the database (optional):**
   ```bash
   node seed.js
   ```
   This will populate the database with sample divisions, districts, and thanas.

5. **Start the server:**
   ```bash
   npm start
   ```
   The server will run on: **http://127.0.0.1:1396**

---

## 📖 API Documentation

### Base URL
```
http://127.0.0.1:1396
```

---

## FEATURE 1: Problem Reporting APIs

### 1. Create a New Problem Report
```
Endpoint: POST /api/problems
HTTP Method: POST
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Severe Pothole on Main Road",
  "description": "There is a large pothole near the traffic light that is causing safety issues for vehicles",
  "category": "Road Damage",
  "division": "61a8d4c8f8f1e9c4b0e2f1a1",
  "district": "61a8d4c8f8f1e9c4b0e2f1a2",
  "thana": "61a8d4c8f8f1e9c4b0e2f1a3",
  "userName": "Ahmed Khan",
  "userEmail": "ahmed@example.com",
  "userPhone": "+8801712345678"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Problem reported successfully",
  "data": {
    "referenceNumber": "ND-A1B2C3D4",
    "problem": {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a4",
      "referenceNumber": "ND-A1B2C3D4",
      "title": "Severe Pothole on Main Road",
      "description": "There is a large pothole...",
      "category": "Road Damage",
      "status": "Acknowledged",
      "submissionTime": "2024-03-07T10:30:00.000Z",
      "createdAt": "2024-03-07T10:30:00.000Z"
    }
  }
}
```

**Status Code:** `201 Created`

---

### 2. Create Problem Report with Image Upload
```
Endpoint: POST /api/problems
HTTP Method: POST
```

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `title`: string
- `description`: string
- `category`: string
- `division`: ObjectId
- `district`: ObjectId
- `thana`: ObjectId
- `image`: file (JPG, PNG, GIF, WebP - max 5MB)
- `userName`: string
- `userEmail`: string
- `userPhone`: string

**Response:** Same as above with image URL included

---

### 3. Get All Problems
```
Endpoint: GET /api/problems
HTTP Method: GET
```

**Query Parameters (Optional):**
```
?page=1&limit=10&category=Road Damage&status=Acknowledged
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a4",
      "referenceNumber": "ND-A1B2C3D4",
      "title": "Severe Pothole on Main Road",
      "description": "There is a large pothole...",
      "category": "Road Damage",
      "status": "Acknowledged",
      "division": {
        "_id": "61a8d4c8f8f1e9c4b0e2f1a1",
        "name": "Dhaka",
        "code": "DHK"
      },
      "district": {
        "_id": "61a8d4c8f8f1e9c4b0e2f1a2",
        "name": "Dhaka City",
        "code": "DHK-01"
      },
      "thana": {
        "_id": "61a8d4c8f8f1e9c4b0e2f1a3",
        "name": "Dhanmondi",
        "code": "DHK-01-01"
      },
      "submissionTime": "2024-03-07T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

**Status Code:** `200 OK`

---

## FEATURE 2: Issue Tracking APIs

### 4. Get Problem by Reference Number
```
Endpoint: GET /api/problems/reference/{referenceNumber}
HTTP Method: GET
```

**Example:**
```
GET /api/problems/reference/ND-A1B2C3D4
```

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "61a8d4c8f8f1e9c4b0e2f1a4",
    "referenceNumber": "ND-A1B2C3D4",
    "title": "Severe Pothole on Main Road",
    "description": "There is a large pothole...",
    "category": "Road Damage",
    "status": "In Progress",
    "submissionTime": "2024-03-07T10:30:00.000Z",
    "division": {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a1",
      "name": "Dhaka",
      "code": "DHK"
    },
    "userName": "Ahmed Khan",
    "userEmail": "ahmed@example.com",
    "userPhone": "+8801712345678"
  }
}
```

**Status Code:** `200 OK`

---

### 5. Get Problem Current Status
```
Endpoint: GET /api/problems/{id}/status
HTTP Method: GET
```

**Example:**
```
GET /api/problems/61a8d4c8f8f1e9c4b0e2f1a4/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "referenceNumber": "ND-A1B2C3D4",
    "currentStatus": "In Progress",
    "submissionTime": "2024-03-07T10:30:00.000Z"
  }
}
```

**Status Code:** `200 OK`

---

### 6. Get Problem Timeline & History
```
Endpoint: GET /api/problems/{id}/timeline
HTTP Method: GET
```

**Example:**
```
GET /api/problems/61a8d4c8f8f1e9c4b0e2f1a4/timeline
```

**Response:**
```json
{
  "success": true,
  "data": {
    "referenceNumber": "ND-A1B2C3D4",
    "submissionTime": "2024-03-07T10:30:00.000Z",
    "currentStatus": "In Progress",
    "timeline": [
      {
        "status": "Acknowledged",
        "timestamp": "2024-03-07T10:30:00.000Z",
        "notes": "Problem reported and acknowledged"
      },
      {
        "status": "In Progress",
        "timestamp": "2024-03-07T11:45:00.000Z",
        "notes": "Field team assigned for inspection"
      }
    ]
  }
}
```

**Status Code:** `200 OK`

---

### 7. Update Problem Status (Admin)
```
Endpoint: PUT /api/problems/{id}/status
HTTP Method: PUT
```

**Example:**
```
PUT /api/problems/61a8d4c8f8f1e9c4b0e2f1a4/status
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "Resolved",
  "notes": "Pothole has been filled and road surface repaired"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Problem status updated successfully",
  "data": {
    "_id": "61a8d4c8f8f1e9c4b0e2f1a4",
    "referenceNumber": "ND-A1B2C3D4",
    "status": "Resolved",
    "timeline": [
      {
        "status": "Acknowledged",
        "timestamp": "2024-03-07T10:30:00.000Z",
        "notes": "Problem reported and acknowledged"
      },
      {
        "status": "In Progress",
        "timestamp": "2024-03-07T11:45:00.000Z",
        "notes": "Field team assigned for inspection"
      },
      {
        "status": "Resolved",
        "timestamp": "2024-03-07T14:20:00.000Z",
        "notes": "Pothole has been filled and road surface repaired"
      }
    ]
  }
}
```

**Status Code:** `200 OK`

---

## AREA HIERARCHY APIs

### 8. Create Division
```
Endpoint: POST /api/divisions
HTTP Method: POST
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Sylhet",
  "code": "SYL"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Division created successfully",
  "data": {
    "_id": "61a8d4c8f8f1e9c4b0e2f1a5",
    "name": "Sylhet",
    "code": "SYL",
    "createdAt": "2024-03-07T10:30:00.000Z"
  }
}
```

**Status Code:** `201 Created`

---

### 9. Get All Divisions
```
Endpoint: GET /api/divisions
HTTP Method: GET
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a1",
      "name": "Dhaka",
      "code": "DHK"
    },
    {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a6",
      "name": "Chittagong",
      "code": "CTG"
    }
  ]
}
```

**Status Code:** `200 OK`

---

### 10. Create District
```
Endpoint: POST /api/districts
HTTP Method: POST
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Rajshahi District",
  "code": "RAJ-01",
  "division": "61a8d4c8f8f1e9c4b0e2f1a1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "District created successfully",
  "data": {
    "_id": "61a8d4c8f8f1e9c4b0e2f1a7",
    "name": "Rajshahi District",
    "code": "RAJ-01",
    "division": "61a8d4c8f8f1e9c4b0e2f1a1"
  }
}
```

**Status Code:** `201 Created`

---

### 11. Get Districts by Division
```
Endpoint: GET /api/districts/{divisionId}
HTTP Method: GET
```

**Example:**
```
GET /api/districts/61a8d4c8f8f1e9c4b0e2f1a1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a2",
      "name": "Dhaka City",
      "code": "DHK-01",
      "division": {
        "_id": "61a8d4c8f8f1e9c4b0e2f1a1",
        "name": "Dhaka",
        "code": "DHK"
      }
    }
  ]
}
```

**Status Code:** `200 OK`

---

### 12. Create Thana
```
Endpoint: POST /api/thanas
HTTP Method: POST
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Motijheel",
  "code": "DHK-01-03",
  "district": "61a8d4c8f8f1e9c4b0e2f1a2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thana created successfully",
  "data": {
    "_id": "61a8d4c8f8f1e9c4b0e2f1a8",
    "name": "Motijheel",
    "code": "DHK-01-03",
    "district": "61a8d4c8f8f1e9c4b0e2f1a2"
  }
}
```

**Status Code:** `201 Created`

---

### 13. Get Thanas by District
```
Endpoint: GET /api/thanas/{districtId}
HTTP Method: GET
```

**Example:**
```
GET /api/thanas/61a8d4c8f8f1e9c4b0e2f1a2
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a3",
      "name": "Dhanmondi",
      "code": "DHK-01-01",
      "district": {
        "_id": "61a8d4c8f8f1e9c4b0e2f1a2",
        "name": "Dhaka City",
        "code": "DHK-01"
      }
    }
  ]
}
```

**Status Code:** `200 OK`

---

### 14. Health Check
```
Endpoint: GET /health
HTTP Method: GET
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-03-07T10:30:00.000Z"
}
```

**Status Code:** `200 OK`

---

## 📊 Category Options

```
- Road Damage
- Water Supply
- Sewage
- Street Light
- Waste Management
- Public Health
- Safety
- Other
```

## 📌 Status Options

```
- Acknowledged
- In Progress
- Resolved
```

---

## ✅ Testing with Postman

### Step 1: Import Collection
1. Download the Postman collection: [Download Link](#)
2. Open Postman
3. Click **Import** → Select the JSON file
4. The collection will be loaded with all endpoints

### Step 2: Set Environment Variables
1. Create a new environment named "Nagar Darpan"
2. Add variables:
   - `base_url` = `http://127.0.0.1:1396`
   - `division_id` = (Copy from /api/divisions response)
   - `district_id` = (Copy from /api/districts response)
   - `thana_id` = (Copy from /api/thanas response)

### Step 3: Run Tests
1. Select the environment from dropdown
2. Click each request and press **Send**
3. Verify the response

### Manual Testing Steps (without collection):

1. **Get all divisions:**
   - URL: `127.0.0.1:1396/api/divisions`
   - Method: GET

2. **Create a problem:**
   - URL: `127.0.0.1:1396/api/problems`
   - Method: POST
   - Body: (See example above)

3. **Track problem by reference:**
   - URL: `127.0.0.1:1396/api/problems/reference/ND-A1B2C3D4`
   - Method: GET

4. **Check status:**
   - URL: `127.0.0.1:1396/api/problems/{problem_id}/status`
   - Method: GET

5. **Update status:**
   - URL: `127.0.0.1:1396/api/problems/{problem_id}/status`
   - Method: PUT
   - Body: `{"status": "In Progress", "notes": "Inspection started"}`

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js              # MongoDB connection
├── controllers/
│   ├── problemController.js     # Problem CRUD & tracking
│   └── areaController.js        # Area hierarchy (Division, District, Thana)
├── middleware/
│   ├── upload.js               # Multer file upload
│   └── errorHandler.js         # Error handling
├── models/
│   ├── Division.js
│   ├── District.js
│   ├── Thana.js
│   └── Problem.js
├── routes/
│   ├── problemRoutes.js
│   └── areaRoutes.js
├── uploads/                     # Uploaded images storage
├── server.js                    # Main server file
├── seed.js                      # Database seeding
├── package.json
├── .env                        # Environment variables
└── README.md
```

---

## 🔧 Environment Variables (.env)

```
MONGODB_URI=mongodb://localhost:27017/nagar-darpan
PORT=1396
NODE_ENV=development
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify port 27017 is available

### Port Already in Use
```bash
# Change port in .env file
PORT=1397
```

### File Upload Issues
- Max file size: 5MB
- Allowed formats: JPG, PNG, GIF, WebP
- Check `uploads/` folder permissions

### Dependencies Issues
```bash
npm install --force
```

---

## 📝 Notes

- All timestamps are in UTC
- Reference numbers are auto-generated (e.g., ND-A1B2C3D4)
- Image uploads are optional
- Database auto-generates ObjectIds
- Timeline automatically tracks all status changes

---

**Created for Assignment Submission**  
**Student ID:** 22301396  
**Server Port:** 1396
