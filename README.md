# JustifAi - Lawyer Appointment Booking System

<p align="center">
  <img src="./client/src/assets/images/logo.png" alt="JustifAi logo" width="220" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Mongoose" />
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.IO Realtime" />
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</p>

<p align="center">
  Full-stack platform for booking lawyer consultations, managing legal profiles, handling appointment workflows, and supporting real-time communication across client, lawyer, and admin dashboards.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Auth-OTP%20%2B%20JWT-7C3AED?style=flat-square" alt="Auth" />
  <img src="https://img.shields.io/badge/Email-Brevo-0EA5E9?style=flat-square" alt="Brevo" />
  <img src="https://img.shields.io/badge/Uploads-Cloudinary-2D9CDB?style=flat-square" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/Frontend-Vite%20%2B%20Tailwind-14B8A6?style=flat-square" alt="Frontend" />
  <img src="https://img.shields.io/badge/Backend-Express%205-111827?style=flat-square" alt="Backend" />
</p>

---

## At a Glance

| Area | What It Covers |
| --- | --- |
| Client | Lawyer discovery, booking, appointment history, notifications, messaging, and profile updates |
| Lawyer | Profile completion, availability, appointment requests, calendar, earnings, and client chat |
| Admin | User management, lawyer onboarding, and verification workflows |
| Platform | OTP auth, Cloudinary uploads, Brevo emails, AI assistant, and Socket.IO realtime updates |

## Highlights

- Role-based auth for `user`, `lawyer`, and `admin`
- Email OTP flows for registration, login, and password reset
- Client dashboard for lawyer discovery, bookings, history, and profile updates
- Lawyer dashboard for requests, calendar view, earnings, profile editing, and availability management
- Admin dashboard for user and lawyer management
- Appointment booking with case evidence uploads
- Appointment approval, rejection, and reschedule workflows
- Availability management with daily slot booking
- Lawyer reviews with automatic rating and review count sync
- Notifications for users and lawyers
- Direct messaging between clients and lawyers
- Real-time Socket.IO updates for message presence and conversation activity
- AI legal assistant for legal and platform questions
- Cloudinary-based media uploads for profile images and case evidence

## Tech Stack

- Frontend: React 19, Vite, React Router, Axios, Tailwind CSS v4, Framer Motion, HeroUI, Socket.IO client, React Hot Toast, React CountUp
- Backend: Node.js, Express 5, Mongoose, JWT, bcrypt, multer, Cloudinary, Socket.IO
- Email: Brevo transactional email API
- AI: Google Gemini via `@google/genai`
- Database: MongoDB

## Project Structure

```text
.
|-- client/                 # React frontend
|   |-- src/pages/          # Auth, client, lawyer, admin, messages, static pages
|   |-- src/components/     # Shared UI, dashboard widgets, AI chat, booking UI
|   |-- src/context/        # Auth context
|   `-- src/utils/          # API helper and socket helpers
|
`-- server/                 # Express backend
    |-- src/config/         # Env, DB, Cloudinary config
    |-- src/controllers/    # Route handlers
    |-- src/models/         # Mongoose models
    |-- src/routes/         # API routes
    |-- src/services/       # AI, email, messaging, notifications, realtime
    `-- src/middlewares/    # Upload, auth, and role middleware
```

## Main User Flows

### Clients

- Register and log in with email OTP or password
- Search lawyers by name, specialization, and location
- View featured and recommended lawyers
- Book appointments and attach case evidence
- Track appointment history and reschedule requests
- View notifications and message lawyers directly
- Update profile information from the dashboard

### Lawyers

- Register with a license number
- Complete profile with bio, education, specializations, fees, and profile image
- Manage availability and time slots
- Review pending appointment requests and reschedule requests
- View calendar and earnings pages
- Chat with clients and manage conversation read state
- View notifications and public lawyer profile details

### Admins

- Log in to the admin dashboard
- Create users and lawyers
- Review lawyer onboarding and verification
- Update or delete users and lawyers
- View dashboard panels for overview, reports, financials, and settings

## API Routes

Base URL: `http://localhost:3000/api`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/register/request-otp`
- `POST /api/auth/register/verify-otp`
- `POST /api/auth/login`
- `POST /api/auth/login/request-otp`
- `POST /api/auth/login/verify-otp`
- `POST /api/auth/password/request-otp`
- `POST /api/auth/password/reset-with-otp`

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
- `GET /api/appointments/lawyer/:id`
- `GET /api/appointments/lawyer/:id/reschedule-requests`
- `GET /api/appointments/user/:id`
- `GET /api/appointments/:id`
- `PUT /api/appointments/:id`
- `PUT /api/appointments/:id/reschedule-request`
- `PUT /api/appointments/:id/reschedule-response`
- `DELETE /api/appointments/:id`

`POST /api/appointments` accepts `caseEvidence` as a file upload.

### Availability

- `POST /api/availability`
- `GET /api/availability/:lawyerId/:date`
- `GET /api/availability/lawyer/:lawyerId`
- `PATCH /api/availability/book-slot`
- `DELETE /api/availability/:id`

### Reviews

- `POST /api/reviews`
- `GET /api/reviews/lawyer/:lawyerId`
- `GET /api/reviews/user/:userId`
- `GET /api/reviews/:id`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`

### Notifications

- `GET /api/notifications/user/:userId`
- `GET /api/notifications/lawyer/:lawyerId`
- `PUT /api/notifications/user/:userId/read-all`
- `PUT /api/notifications/lawyer/:lawyerId/read-all`
- `PUT /api/notifications/user/:userId/:notificationId/read`
- `PUT /api/notifications/lawyer/:lawyerId/:notificationId/read`

### Messages

- `POST /api/messages/conversations/ensure`
- `GET /api/messages/conversations?userId=...&role=...`
- `GET /api/messages/:conversationId?userId=...&role=...`
- `PATCH /api/messages/:conversationId/read`

Socket.IO namespace: `/messages`

Supported realtime events include:

- `identify`
- `join_conversation`
- `leave_conversation`
- `mark_read`
- `send_message`
- `react_message`
- `presence_update`
- `conversation_message`
- `conversation_read`
- `message_reaction`

### Stats

- `GET /api/stats`

Returns:

- total clients
- lawyer count
- total appointments
- average satisfaction rating

### AI Assistant

- `POST /api/ai/generate`
- `GET /api/ai/self-test`

### Test

- `GET /api/test/keep-alive`

## Data Models

### User

- `name`, `email`, `phone`, `password`
- `gender`, `city`, `state`
- `role` = `user`
- `isActive`

### Lawyer

- Auth fields plus `licenseNo`
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
- `date`, `timeSlot`, `appointmentMode`
- `feeCharged`, `status`, `isActive`
- reschedule metadata
- optional `caseEvidence`

Unique index:

- `lawyerId + date + timeSlot`

### Availability

- `lawyerId`, `date`
- `slots[]` with time and booking state

### Review

- `userId`, `lawyerId`, `appointmentId`
- `rating`, `comment`

### Messaging and Notifications

- `Conversation`
- `Message`
- `Notification`

### Supporting Models

- `EmailOtp`
- `Admin`
- `Payment`
- `Cancellation`

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

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=JustifAi

EMAIL_OTP_TTL_MINUTES=10
EMAIL_OTP_LENGTH=6
EMAIL_OTP_COOLDOWN_SECONDS=60
DISPOSABLE_EMAIL_DOMAINS=example1.com,example2.com

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

If you prefer, `GOOGLE_API_KEY` can be used as the Gemini fallback key.

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

## Notes

- MongoDB connection and conversation index sync happen during server startup
- CORS is restricted by `FRONTEND_URL`
- Lawyer profile uploads and appointment evidence uploads require valid Cloudinary credentials
- Brevo credentials are required for OTP, welcome, booking, and rejection emails
- The frontend expects `VITE_API_BASE_URL` to point at the backend API root, usually `http://localhost:3000/api`
- The AI assistant is restricted to legal topics and JustifAi platform help
- The messaging UI uses Socket.IO for realtime conversation updates and presence tracking

## Future Improvements

- Add automated tests for frontend and backend flows
- Harden validation and centralized error handling
- Add payment API endpoints if payment workflows are activated
- Expand notification delivery channels beyond in-app updates
