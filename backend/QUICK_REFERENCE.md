# API Quick Reference Guide

**Server:** http://127.0.0.1:1396  
**Student ID:** 22301396  
**Database:** MongoDB

---

## FEATURE 1: Problem Reporting (4 APIs)

| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 1 | `/api/problems` | POST | Create new problem report |
| 2 | `/api/problems` | GET | Get all problems (paginated) |
| 3 | `/api/problems/:id` | GET | Get problem by ID |
| 4 | `/api/problems/:id` | DELETE | Delete problem (admin) |

---

## FEATURE 2: Issue Tracking (4 APIs)

| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 5 | `/api/problems/reference/:refNum` | GET | Get problem by reference number |
| 6 | `/api/problems/:id/status` | GET | Get current status |
| 7 | `/api/problems/:id/status` | PUT | Update status with timeline |
| 8 | `/api/problems/:id/timeline` | GET | Get full timeline/history |

---

## Area Hierarchy (6 APIs)

| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 9 | `/api/divisions` | POST | Create division |
| 10 | `/api/divisions` | GET | Get all divisions |
| 11 | `/api/districts` | POST | Create district |
| 12 | `/api/districts/:divisionId` | GET | Get districts by division |
| 13 | `/api/thanas` | POST | Create thana |
| 14 | `/api/thanas/:districtId` | GET | Get thanas by district |

---

## Health Check

| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 15 | `/health` | GET | Check server status |

---

## Status Codes Quick Reference

```
201 Created      ✅ Resource created successfully
200 OK           ✅ Request successful
400 Bad Request  ❌ Invalid data
404 Not Found    ❌ Resource doesn't exist
500 Server Error ❌ Internal error
```

---

## Category Enum Values
```
"Road Damage"
"Water Supply"
"Sewage"
"Street Light"
"Waste Management"
"Public Health"
"Safety"
"Other"
```

## Status Enum Values
```
"Acknowledged"
"In Progress"
"Resolved"
```

---

## Quick Test Commands (PowerShell)

### Health Check
```bash
curl http://127.0.0.1:1396/health
```

### Get All Divisions
```bash
curl http://127.0.0.1:1396/api/divisions
```

### Get All Problems
```bash
curl http://127.0.0.1:1396/api/problems
```

---

## Sample Request/Response

### Create Problem (POST /api/problems)
```json
{
  "title": "Pothole on Main Road",
  "description": "Large pothole causing danger",
  "category": "Road Damage",
  "division": "61a8d4c8f8f1e9c4b0e2f1a1",
  "district": "61a8d4c8f8f1e9c4b0e2f1a2",
  "thana": "61a8d4c8f8f1e9c4b0e2f1a3",
  "userName": "Ahmed Khan",
  "userEmail": "ahmed@example.com",
  "userPhone": "+8801712345678"
}
```

**Response (201):** Returns problem object with auto-generated `referenceNumber` (e.g., `ND-A1B2C3D4`)

---

## Update Status (PUT /api/problems/{id}/status)
```json
{
  "status": "In Progress",
  "notes": "Field team assigned"
}
```

**Response (200):** Returns updated problem with new timeline entry

---

## MongoDB Collections

```
divisions
├── _id
├── name
├── code
└── timestamps

districts
├── _id
├── name
├── code
├── division (ObjectId)
└── timestamps

thanas
├── _id
├── name
├── code
├── district (ObjectId)
└── timestamps

problems
├── _id
├── referenceNumber (auto-generated unique)
├── title
├── description
├── category
├── division (ObjectId)
├── district (ObjectId)
├── thana (ObjectId)
├── status
├── timeline (array)
├── image (optional)
├── userName
├── userEmail
├── userPhone
└── timestamps
```

---

## File Size Limits
- Image upload: Max 5MB
- Formats: JPG, PNG, GIF, WebP

---

## Pagination
- Default page: 1
- Default limit: 10
- Query: `?page=1&limit=10`

---

## Environment Variables (.env)
```
MONGODB_URI=mongodb://localhost:27017/nagar-darpan
PORT=1396
NODE_ENV=development
```

---

## Keys to Remember

✅ **All timestamps are in UTC**  
✅ **Reference numbers are auto-generated**  
✅ **ObjectIds are 24-character hex strings**  
✅ **Image field is optional**  
✅ **Timeline auto-updates with status changes**  

---

**Created:** March 7, 2024 | **Student ID:** 22301396
