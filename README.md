# JustifAi - Lawyer Appointment Booking System

JustifAi is a full-stack web application for booking lawyer consultations, managing legal profiles, and handling appointment workflows across client, lawyer, and admin dashboards. The project includes a React + Vite frontend, an Express + MongoDB backend, lawyer profile image uploads through Cloudinary, and an AI legal assistant powered by Gemini.

## What's Included

- Role-based authentication for `user`, `lawyer`, and `admin`
- Client dashboard with lawyer search, appointment history, and profile editing
- Lawyer dashboard with pending requests, daily schedule view, and profile pages
- Admin dashboard for user management, lawyer onboarding, and verification workflows
- Lawyer profile completion flow with image upload support
- Appointment creation, listing, filtering, approval/rejection updates, and history views
- Availability management for lawyer time slots
- Lawyer reviews with automatic rating and total review recalculation
- Platform stats endpoint used for dashboard metrics
- Embedded AI legal assistant for legal/platform questions

## Tech Stack

- Frontend: React 19, Vite, React Router, Axios, Tailwind CSS v4, Framer Motion, HeroUI
- Backend: Node.js, Express 5, Mongoose, JWT, bcrypt, multer, Cloudinary
- Database: MongoDB
- AI: Google Gemini via `@google/genai`

## Project Structure

```text
.
|-- client/                 # React frontend
|   |-- src/pages/          # Client, lawyer, admin, auth pages
|   |-- src/components/     # Shared UI, admin widgets, AI chat widget
|   |-- src/context/        # Auth context
|   `-- src/utils/api.js    # Frontend API base URL
|
`-- server/                 # Express backend
    |-- src/config/         # DB, env, Cloudinary config
    |-- src/controllers/    # Route handlers
    |-- src/models/         # Mongoose models
    |-- src/routes/         # API routes
    |-- src/services/       # AI service
    `-- src/middlewares/    # Upload/auth/role middleware
```

## Main User Flows

### Clients

- Register and log in
- Search lawyers by name, specialization, and location
- View recommended lawyers
- Book appointments and review appointment history
- Update personal profile details from the dashboard

### Lawyers

- Register with a license number
- Complete profile with bio, education, specializations, fees, and profile image
- View pending appointment requests
- Review daily schedule by selected date
- See upcoming appointments and public lawyer profile details

### Admins

- Log in to the admin dashboard
- Create users and lawyers
- Review lawyer verification queue
- Approve or reject lawyer onboarding
- View overview, appointment, report, financial, and settings panels

## Backend API Overview

Base URL: `http://localhost:3000`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Users

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Lawyers

- `GET /api/lawyers`
- `GET /api/lawyers/featured`
- `GET /api/lawyers/:id`
- `PUT /api/lawyers/update-lawyer/:id`
- `PATCH /api/lawyers/featured/:id`
- `PATCH /api/lawyers/complete-profile/:id`
- `PATCH /api/lawyers/lawyer-verification/:id`
- `DELETE /api/lawyers/delete-lawyer/:id`

### Appointments

- `POST /api/appointments`
- `GET /api/appointments`
- `GET /api/appointments/:id`
- `PUT /api/appointments/:id`
- `DELETE /api/appointments/:id`
- `GET /api/appointments/lawyer/:id`
- `GET /api/appointments/user/:id`

`GET /api/appointments/lawyer/:id` supports:

- `?status=Pending`
- `?date=YYYY-MM-DD`

### Availability

- `POST /api/availability`
- `GET /api/availability/:lawyerId/:date`
- `GET /api/availability/lawyer/:lawyerId`
- `PATCH /api/availability/book-slot`
- `DELETE /api/availability/:id`

### Reviews

- `POST /api/reviews`
- `GET /api/reviews/lawyer/:lawyerId`
- `GET /api/reviews/:id`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`

### Stats

- `GET /api/stats`

Returns:

- total clients
- active lawyers
- total appointments
- average satisfaction rating

### AI Assistant

- `POST /api/ai/generate`
- `GET /api/ai/self-test`

The AI assistant is scoped to legal questions and platform-related guidance.

## Data Models

### User

- `name`, `email`, `phone`, `password`
- `role` = `user`
- `isActive`

### Lawyer

- Basic auth fields plus `licenseNo`
- `profileImage`, `location`, `bio`, `practiceCourt`
- `education[]`
- `specializations[]`
- `feesByCategory[]`
- `experience`, `rating`, `totalReviews`, `totalAppointments`
- `verification`, `isFeatured`, `isProfileComplete`, `isActive`

### Appointment

- `userId`, `lawyerId`
- `lawyerName`, `lawyerSpecialization`
- `caseCategory`, `caseDescription`
- `date`, `timeSlot`, `feeCharged`
- `status`, `isActive`

Unique index:

- `lawyerId + date + timeSlot`

### Availability

- `lawyerId`, `date`
- `slots[]` with time and booking state

### Review

- `userId`, `lawyerId`
- `rating`, `comment`

Review updates automatically sync lawyer `rating` and `totalReviews`.

## Environment Variables

Create `server/.env`:

```bash
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/justifai
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Create `client/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## Installation

```bash
git clone <your-repo-url>
cd lawyer-appointment-booking-system
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

## Running Locally

Start the backend:

```bash
cd server
npm start
```

Start the frontend:

```bash
cd client
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Available Scripts

### Client

- `npm run dev` - start Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

### Server

- `npm start` - run the backend with nodemon
- `npm test` - placeholder test script

## Current Notes

- MongoDB connection is active through `server/src/config/db.js`
- CORS is restricted by `FRONTEND_URL`
- Lawyer profile uploads require valid Cloudinary credentials
- The frontend expects `VITE_API_BASE_URL` for API requests
- Payment routes and models exist in the codebase, but payment routes are not currently mounted in `server.js`
- Automated tests are not set up yet

## Future Improvements

- Protect routes with the existing auth and role middleware
- Add payment gateway integration to the live API
- Add notifications and real-time updates
- Add automated tests for frontend and backend flows
- Harden validation and centralized error handling
