# 🚀 SETUP & RUNNING GUIDE

## Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (Community Edition or Atlas)
- **Postman** (for API testing) - Optional but recommended

---

## METHOD 1: Using MongoDB Locally (Windows)

### Step 1: Install MongoDB Community Edition

1. **Download MongoDB:**
   - Go to https://www.mongodb.com/try/download/community
   - Select **Windows**, latest stable version
   - Download the `.msi` installer

2. **Install MongoDB:**
   - Run the installer
   - Choose **Complete** installation
   - Check "**Install MongoDB as a Service**" (Recommended)
   - Click Install

3. **Verify Installation:**
   ```bash
   mongod --version
   ```

### Step 2: Start MongoDB Service

**Option A: Using Services (Easiest)**
- Press `Win + R`, type `services.msc`, press Enter
- Find **MongoDB Server** in the list
- Right-click → **Start** (or it may already be running)
- Status should show "Running"

**Option B: Using Command Line**
```bash
mongod
```
This will start MongoDB on `mongodb://localhost:27017`

### Step 3: Verify MongoDB is Running

Open a new PowerShell/Command terminal:
```bash
mongo
```
or (newer versions):
```bash
mongosh
```

You should see the MongoDB shell prompt `>`.

---

## METHOD 2: Using MongoDB Atlas (Cloud - Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click **Sign Up** (or Sign In if you have account)
3. Create a free account

### Step 2: Create a Cluster
1. Click **Create a Deployment**
2. Choose **FREE** tier
3. Select **AWS**, **us-east-1** region
4. Click **Create Deployment**
5. Wait for cluster to initialize (5-10 minutes)

### Step 3: Get Connection String
1. Click **Connect**
2. Choose **Drivers** → **Node.js**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nagar-darpan?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

### Step 4: Update .env File
Open `d:\NagarDarpan\backend\.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nagar-darpan?retryWrites=true&w=majority
PORT=1396
NODE_ENV=development
```

---

## Backend Setup & Running

### Step 1: Install Dependencies
```bash
cd d:\NagarDarpan\backend
npm install
```

### Step 2: Seed Database (Optional)
This populates sample divisions, districts, and thanas:
```bash
node seed.js
```

**Expected Output:**
```
Connected to MongoDB
Cleared existing data
Created 4 divisions
Created 5 districts
Created 7 thanas
✓ Database seeded successfully!
```

### Step 3: Start the Server
```bash
npm start
```

**Expected Output:**
```
╔═══════════════════════════════════════╗
║  Nagar Darpan Backend Server Running  ║
║  Port: 1396                           ║
║  Environment: development             ║
╚═══════════════════════════════════════╝
```

✅ **Server is now running on:** `http://127.0.0.1:1396`

---

## Testing the APIs

### Quick Test (Without Postman)

Open PowerShell and test the health endpoint:
```bash
curl http://127.0.0.1:1396/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-03-07T10:30:00.000Z"
}
```

### Full Testing with Postman

#### Import the Collection:
1. Open **Postman**
2. Click **Import** (top-left)
3. Select `Nagar_Darpan_API.postman_collection.json` from backend folder
4. Click **Open**

#### Set Environment Variables:
1. Click **Environments** (left sidebar)
2. Create **New Environment** → Name it "Nagar Darpan Local"
3. Add one variable:
   ```
   base_url = http://127.0.0.1:1396
   ```

> **Note:** The remaining variables (`division_id`, `district_id`, `thana_id`, `problem_id`, `reference_number`) are **automatically set** by Postman test scripts when you run the API requests in order. No need to copy-paste IDs manually!

#### Test Requests:
1. Select environment from dropdown
2. Open **Nagar Darpan API Collection**
3. Follow this order:
   - **Health Check** → GET /health
   - **Get All Divisions** → GET /api/divisions (copy division_id)
   - **Get Districts by Division** → GET /api/districts/{divisionId} (copy district_id)
   - **Get Thanas by District** → GET /api/thanas/{districtId} (copy thana_id)
   - **Create Problem Report** → POST /api/problems (copy problem_id)
   - **Get Problem by Reference** → GET /api/problems/reference/{referenceNumber}
   - **Get Problem Timeline** → GET /api/problems/{id}/timeline
   - **Update Problem Status** → PUT /api/problems/{id}/status

---

## 📋 Complete Testing Checklist

Use this checklist to test and document all APIs:

### Feature 1: Problem Reporting
- [ ] **Create Problem Report**
  - Endpoint: `POST /api/problems`
  - Status: 201
  - Screenshot: ___________

- [ ] **Create Problem with Image**
  - Endpoint: `POST /api/problems`
  - Status: 201
  - Screenshot: ___________

- [ ] **Get All Problems**
  - Endpoint: `GET /api/problems`
  - Status: 200
  - Screenshot: ___________

- [ ] **Get Problem by ID**
  - Endpoint: `GET /api/problems/{id}`
  - Status: 200
  - Screenshot: ___________

### Feature 2: Issue Tracking
- [ ] **Get Problem by Reference Number**
  - Endpoint: `GET /api/problems/reference/{referenceNumber}`
  - Status: 200
  - Screenshot: ___________

- [ ] **Get Current Status**
  - Endpoint: `GET /api/problems/{id}/status`
  - Status: 200
  - Screenshot: ___________

- [ ] **Get Timeline & History**
  - Endpoint: `GET /api/problems/{id}/timeline`
  - Status: 200
  - Screenshot: ___________

- [ ] **Update Problem Status**
  - Endpoint: `PUT /api/problems/{id}/status`
  - Status: 200
  - Screenshot: ___________

### Area Hierarchy
- [ ] **Get All Divisions**
  - Endpoint: `GET /api/divisions`
  - Status: 200
  - Screenshot: ___________

- [ ] **Get Districts**
  - Endpoint: `GET /api/districts/{divisionId}`
  - Status: 200
  - Screenshot: ___________

- [ ] **Get Thanas**
  - Endpoint: `GET /api/thanas/{districtId}`
  - Status: 200
  - Screenshot: ___________

---

## 🔧 Troubleshooting

### Problem: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check MongoDB status on Windows
Get-Service MongoDB
# If not running:
Start-Service MongoDB
```

### Problem: "Port 1396 already in use"
**Solution:**
Change port in `.env`:
```env
PORT=1397
```

### Problem: "npm start not working"
**Solution:**
```bash
# Clear npm cache
npm cache clean --force
# Reinstall dependencies
npm install
# Start again
npm start
```

### Problem: "Cannot find module 'express'"
**Solution:**
```bash
# Reinstall all dependencies
npm install
```

### Problem: "Image upload not working"
**Check:**
- Image file is less than 5MB
- Format is JPG, PNG, GIF, or WebP
- `uploads/` folder exists in backend directory

---

## 📁 Project Folder Structure

```
d:\NagarDarpan\
├── backend/                          ← You are here
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── problemController.js
│   │   └── areaController.js
│   ├── middleware/
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Division.js
│   │   ├── District.js
│   │   ├── Thana.js
│   │   └── Problem.js
│   ├── routes/
│   │   ├── problemRoutes.js
│   │   └── areaRoutes.js
│   ├── uploads/                      ← Images saved here
│   ├── server.js                    ← Main file
│   ├── seed.js                      ← Database seeding
│   ├── package.json
│   ├── .env
│   ├── README.md
│   ├── SETUP_GUIDE.md              ← This file
│   └── Nagar_Darpan_API.postman_collection.json
```

---

## 🔐 API Response Codes

| Code | Meaning |
|------|---------|
| **200** | OK - Request successful |
| **201** | Created - Resource created successfully |
| **400** | Bad Request - Missing or invalid data |
| **404** | Not Found - Resource not found |
| **500** | Server Error - Internal server error |

---

## 📞 Support

If you encounter any issues:
1. Check the console output for error messages
2. Verify MongoDB is running
3. Check `.env` file is configured correctly
4. Review the README.md for API documentation

---

**Last Updated:** March 7, 2024  
**Student ID:** 22301396  
**Assignment Submission**
