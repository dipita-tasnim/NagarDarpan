# API Test Examples & Expected Responses

## Feature 1 APIs - Problem Reporting

---

### API 1: Create Problem Report
```
Endpoint URL: 127.0.0.1:1396/api/problems
HTTP Method: POST
Headers: Content-Type: application/json
Body: {
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

**Response (201 Created):**
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
      "description": "There is a large pothole near the traffic light that is causing safety issues for vehicles",
      "category": "Road Damage",
      "division": "61a8d4c8f8f1e9c4b0e2f1a1",
      "district": "61a8d4c8f8f1e9c4b0e2f1a2",
      "thana": "61a8d4c8f8f1e9c4b0e2f1a3",
      "status": "Acknowledged",
      "submissionTime": "2024-03-07T10:30:00.000Z",
      "timeline": [
        {
          "status": "Acknowledged",
          "timestamp": "2024-03-07T10:30:00.000Z",
          "notes": "Problem reported and acknowledged"
        }
      ],
      "userName": "Ahmed Khan",
      "userEmail": "ahmed@example.com",
      "userPhone": "+8801712345678",
      "createdAt": "2024-03-07T10:30:00.000Z",
      "updatedAt": "2024-03-07T10:30:00.000Z"
    }
  }
}
```

**Screenshot: Show POST request with above Body, and the Response with 201 status code**

---

### API 2: Create Problem Report with Image
```
Endpoint URL: 127.0.0.1:1396/api/problems
HTTP Method: POST
Headers: Content-Type: multipart/form-data (auto-set by Postman)
```

**Form Data:**
- title: "Water Supply Issue in Area"
- description: "No water for 3 days in residential area"
- category: "Water Supply"
- division: (ObjectId from divisions)
- district: (ObjectId from districts)
- thana: (ObjectId from thanas)
- userName: "Fatima Begum"
- userEmail: "fatima@example.com"
- userPhone: "+8801912345678"
- image: (Select JPG/PNG file from your computer)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Problem reported successfully",
  "data": {
    "referenceNumber": "ND-E5F6G7H8",
    "problem": {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a5",
      "referenceNumber": "ND-E5F6G7H8",
      "title": "Water Supply Issue in Area",
      "image": {
        "filename": "1709875400000.jpg",
        "path": "uploads/1709875400000.jpg",
        "url": "/uploads/1709875400000.jpg"
      },
      "status": "Acknowledged"
    }
  }
}
```

**Screenshot: Show POST request with Form Data, image file selected, and Response with image URL**

---

### API 3: Get All Problems
```
Endpoint URL: 127.0.0.1:1396/api/problems
HTTP Method: GET
Headers: None
Query Parameters: 
  - page=1
  - limit=10
  (Optional: status=Acknowledged, category=Road Damage)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a4",
      "referenceNumber": "ND-A1B2C3D4",
      "title": "Severe Pothole on Main Road",
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
      "submissionTime": "2024-03-07T10:30:00.000Z"
    },
    {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a5",
      "referenceNumber": "ND-E5F6G7H8",
      "title": "Water Supply Issue",
      "category": "Water Supply",
      "status": "Acknowledged",
      "submissionTime": "2024-03-07T11:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Screenshot: Show GET request with query parameters, and Response showing multiple problems with pagination**

---

## Feature 2 APIs - Issue Tracking

---

### API 4: Get Problem by Reference Number
```
Endpoint URL: 127.0.0.1:1396/api/problems/reference/ND-A1B2C3D4
HTTP Method: GET
Headers: None
Body: None
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "61a8d4c8f8f1e9c4b0e2f1a4",
    "referenceNumber": "ND-A1B2C3D4",
    "title": "Severe Pothole on Main Road",
    "description": "There is a large pothole near the traffic light that is causing safety issues for vehicles",
    "category": "Road Damage",
    "status": "Acknowledged",
    "submissionTime": "2024-03-07T10:30:00.000Z",
    "userName": "Ahmed Khan",
    "userEmail": "ahmed@example.com",
    "userPhone": "+8801712345678"
  }
}
```

**Screenshot: Show GET request with reference number in URL, and Response showing complete problem details**

---

### API 5: Get Problem Current Status
```
Endpoint URL: 127.0.0.1:1396/api/problems/61a8d4c8f8f1e9c4b0e2f1a4/status
HTTP Method: GET
Headers: None
Body: None
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "referenceNumber": "ND-A1B2C3D4",
    "currentStatus": "Acknowledged",
    "submissionTime": "2024-03-07T10:30:00.000Z"
  }
}
```

**Screenshot: Show GET request with problem ID in URL, and Response showing status information**

---

### API 6: Get Problem Timeline & History
```
Endpoint URL: 127.0.0.1:1396/api/problems/61a8d4c8f8f1e9c4b0e2f1a4/timeline
HTTP Method: GET
Headers: None
Body: None
```

**Response (200 OK):**
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

**Screenshot: Show GET request with problem ID in URL, and Response showing timeline with multiple status updates**

---

### API 7: Update Problem Status
```
Endpoint URL: 127.0.0.1:1396/api/problems/61a8d4c8f8f1e9c4b0e2f1a4/status
HTTP Method: PUT
Headers: Content-Type: application/json
Body: {
  "status": "Resolved",
  "notes": "Pothole has been filled and road surface repaired"
}
```

**Response (200 OK):**
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

**Screenshot: Show PUT request with problem ID and status update in Body, and Response showing updated timeline**

---

## Area Hierarchy APIs

---

### API 8: Get All Divisions
```
Endpoint URL: 127.0.0.1:1396/api/divisions
HTTP Method: GET
Headers: None
Body: None
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a1",
      "name": "Dhaka",
      "code": "DHK",
      "createdAt": "2024-03-07T10:00:00.000Z"
    },
    {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a6",
      "name": "Chittagong",
      "code": "CTG",
      "createdAt": "2024-03-07T10:00:00.000Z"
    }
  ]
}
```

**Screenshot: Show GET request and Response showing list of divisions**

---

### API 9: Get Districts by Division
```
Endpoint URL: 127.0.0.1:1396/api/districts/61a8d4c8f8f1e9c4b0e2f1a1
HTTP Method: GET
Headers: None
Body: None
```

**Response (200 OK):**
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
    },
    {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a7",
      "name": "Gazipur",
      "code": "DHK-02",
      "division": {
        "_id": "61a8d4c8f8f1e9c4b0e2f1a1",
        "name": "Dhaka",
        "code": "DHK"
      }
    }
  ]
}
```

**Screenshot: Show GET request with division ID in URL, and Response showing districts under that division**

---

### API 10: Get Thanas by District
```
Endpoint URL: 127.0.0.1:1396/api/thanas/61a8d4c8f8f1e9c4b0e2f1a2
HTTP Method: GET
Headers: None
Body: None
```

**Response (200 OK):**
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
    },
    {
      "_id": "61a8d4c8f8f1e9c4b0e2f1a8",
      "name": "Gulshan",
      "code": "DHK-01-02",
      "district": {
        "_id": "61a8d4c8f8f1e9c4b0e2f1a2",
        "name": "Dhaka City",
        "code": "DHK-01"
      }
    }
  ]
}
```

**Screenshot: Show GET request with district ID in URL, and Response showing thanas under that district**

---

## Testing Checklist with Screenshots

For your assignment submission, take a screenshot of each API as shown above:

1. ✅ **Create Problem** - POST /api/problems
2. ✅ **Create Problem with Image** - POST /api/problems (with file)
3. ✅ **Get All Problems** - GET /api/problems?page=1&limit=10
4. ✅ **Get Problem by Reference** - GET /api/problems/reference/ND-XXXXX
5. ✅ **Get Current Status** - GET /api/problems/{id}/status
6. ✅ **Get Timeline/History** - GET /api/problems/{id}/timeline
7. ✅ **Update Status** - PUT /api/problems/{id}/status
8. ✅ **Get Divisions** - GET /api/divisions
9. ✅ **Get Districts** - GET /api/districts/{divisionId}
10. ✅ **Get Thanas** - GET /api/thanas/{districtId}

---

## Notes for Screenshots

Each screenshot should clearly show:
- **The complete URL** (visible in Postman)
- **HTTP Method** (GET, POST, PUT, etc.)
- **Headers** (if any)
- **Request Body/Parameters** (if any)
- **Response Status Code** (200, 201, 404, etc.)
- **Response Body** (formatted JSON)

---

**Last Updated:** March 7, 2024  
**Student ID:** 22301396
