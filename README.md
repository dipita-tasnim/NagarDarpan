# NagarDarpan 

NagarDarpan is a civic problem reporting and accountability platform for Bangladesh. It turns scattered civic complaints into a structured, public, and accountable workflow. Every problem gets a unique reference number, a transparent status history, community support, geographic context on a map, and a clear escalation path to local authorities, with full transparency.

## Demo

- **Live app:** https://nagar-darpan-lq81.vercel.app
- **Video walkthrough:** https://drive.google.com/file/d/1ODdpSpciu7BE4S-4QTKQMrzyjZLo2KSi/view?usp=sharing

You can **sign up** to create your own account, or use the public demo account below to report and track issues without registering. *(Admin-only features such as moderation and fraud detection are demonstrated in the video walkthrough.)*

| Demo account (citizen) | Password   |
|:-----------------------|:-----------|
| `demo@nagardarpan.com` | `demo1234` |

## Functional Requirements:

- **Report a problem**: with Title, Description, Category, Area (Division → District → Thana), and an optional image.

- **Unique reference number**: (e.g., `ND-A1B2C3D4`) and exact reporting timestamp for every submission.

- **Transparent status lifecycle**: each problem moves through three states, Acknowledged, In Progress, and Resolved.

- **Timestamped status history**: every status change is recorded with a timestamp and note, building a verifiable accountability trail.

- **Before and After evidence**: a *"Before"* image at reporting time and an *"After"* image once the issue is resolved.

- **Public feed**: of all reported problems showing Title, Category, Area, and current Status.

- **Detailed problem view**: with full description, uploaded images, support count, area information, and status.

- **Duplicate prevention**: before a new report is created, the system checks for similar **unresolved**: problems in the same area and category.
  - If a match is found, it shows the existing problem's **title, reference number, and support count**.
  - The user can **support the existing issue** (*"I face this too"*) to help prioritize it.
  - Alternatively, the user may **proceed** with submission if the issue is genuinely different.

- **Filtering**: by area (Division, District, Thana) and by category (Road Damage, Water Supply, Sewage, Street Light, Waste Management, Public Health, Safety, Construction, Other).

- **Community escalation**: to the relevant local authority (e.g., ward councillors) when a problem either:
  - reaches a support threshold (e.g., **20+ supports**), **or**
  - stays unresolved for a defined period (e.g., **14 days**).

- **Automatically generated official complaint**: when eligible, an *"Escalate Issue"* button produces a structured complaint document containing the problem title, description, Division/District/Thana, Google Maps location link, reference number, total support count, reporting date, and current status.
  - **Download as PDF**, **copy formatted text**, and view the **contact details** of the relevant authority (hotline or email).

- **Area statistics**: total problems, most common problem type, and resolved vs. unresolved counts per area.

- **Permanent public record**: problems are never permanently deleted; they remain visible for transparency.

- **Email notifications**: reporters are notified when a status changes or an issue is resolved.

- **Interactive map**: pin the exact location while reporting and view all problems as map markers; click a marker for a problem summary. *(Google Maps API)*

- **NagarBot chatbot**: an assistant for reporting, tracking, escalation, and FAQs, backed by the Google Gemini API with a keyword-based FAQ fallback.

- **Admin panel**: dashboards and analytics, complaint management, feed moderation, escalation center, user management, authority and content management, global notifications, and **fraud detection** to flag suspicious or duplicate reports.


## Tech Stack

● Language: JavaScript 
● Framework:  React.js (Frontend), Node.js & Express.js (Backend)
● Styling: TailwindCSS
● Database: MongoDB 


## Project Structure

```
NagarDarpan/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers (problems, auth, admin, areas, chatbot...)
│   ├── middleware/     # Auth, file upload, error handling
│   ├── models/         # Mongoose schemas (Problem, User, Authority, Content...)
│   ├── routes/         # API route definitions
│   ├── uploads/        # Uploaded images (served statically)
│   ├── utils/          # Email service
│   ├── seed.js         # Seeds areas + a default admin user
│   └── server.js       # App entry point
└── frontend/
    ├── public/
    └── src/
        ├── components/ # UI components (+ admin/ panel components)
        ├── context/    # Auth context
        ├── pages/      # Route pages (Home, Report, Feed, Map, AdminPanel...)
        └── api.js      # Axios API client
```

## Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- A **MongoDB** database: a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier works) or a local MongoDB instance
- *(Optional)* Google Maps API key and Google Gemini API key for maps and the AI chatbot

### 1. Clone the repository

```bash
git clone https://github.com/dipita-tasnim/NagarDarpan.git
cd NagarDarpan
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/nagar-darpan
PORT=1396
NODE_ENV=development
JWT_SECRET=your_jwt_secret

# Email notifications (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Chatbot (optional, falls back to FAQ if omitted)
GEMINI_API_KEY=your_gemini_api_key

# Admin account created by seed.js (optional; pick a strong password)
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=use_a_strong_password
```

*(Optional)* Seed the database with area data and a demo user (and an admin user, if you set `ADMIN_EMAIL` / `ADMIN_PASSWORD` above):

```bash
node seed.js
```

Start the backend:

```bash
npm run dev      # start with nodemon (hot reload)
# or
npm start        # plain node
```

The API runs at **http://localhost:1396**.

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
# Optional, defaults to "/api" (proxied to the backend in dev)
# VITE_API_URL=http://localhost:1396/api
```

Start the frontend:

```bash
npm run dev
```

The app runs at **http://localhost:5173**. The Vite dev server proxies `/api` and `/uploads` to the backend on port `1396`, so no extra configuration is needed for local development.

## Admin Access

The admin panel is created by `seed.js` using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` values from your `.env` file, so no admin credentials are shipped in this repository. Admin capabilities (moderation, fraud detection, analytics, etc.) are demonstrated in the video walkthrough above.

## Available Scripts

**Backend** (`/backend`)

| Command         | Description                          |
|:----------------|:-------------------------------------|
| `npm start`     | Run the server with Node             |
| `npm run dev`   | Run the server with Nodemon (reload) |
| `node seed.js`  | Seed areas, demo user, and admin user |

**Frontend** (`/frontend`)

| Command           | Description                  |
|:------------------|:-----------------------------|
| `npm run dev`     | Start the Vite dev server    |
| `npm run build`   | Build for production         |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |


<p align="center"><i>NagarDarpan, reflecting the voice of every citizen.</i></p>
