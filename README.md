# Lawyer Appointment Booking System

This project is a web-based application designed to facilitate seamless appointment booking between clients and lawyers. The system will allow clients to view lawyer availability, schedule appointments, and receive confirmations. Lawyers will be able to manage their schedules, accept or decline appointments, and maintain client records.

## Highlights
- React + Vite client with Tailwind CSS.
- Node.js + Express server with MongoDB (via Mongoose models).
- Core domain models already defined: Users, Lawyers, Appointments, Payments, Reviews, Notifications.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, Mongoose
- Database: MongoDB (not wired yet in `server.js`)

## Project Structure
- `client/`: React UI (Vite)
- `server/`: Express API
- `server/src/models/`: Mongoose schemas (Users, Lawyers, Appointments, Payments, Reviews, Notifications)
- `server/src/controllers/`, `routes/`, `middlewares/`, `services/`, `utils/`, `validations/`: placeholders for API implementation

## Getting Started

### Prerequisites
- Node.js 18+ recommended
- npm 9+
- MongoDB instance (local or hosted)

### Install Dependencies
```bash
cd client
npm install

cd ../server
npm install
```

### Environment Variables
Create or update `server/.env`:
```bash
PORT=3000
```
Add your MongoDB URI once you wire it in `server.js`:
```bash
MONGODB_URI=mongodb://localhost:27017/lawyer_appointments
```

### Run the App (Dev)
```bash
# Terminal 1 - server
cd server
node server.js

# Terminal 2 - client
cd client
npm run dev
```

Client defaults to `http://localhost:5173`, server defaults to `http://localhost:3000`.

## Current API
The API is currently a minimal stub:
- `GET /` → `API Running...`

## Data Model (Mongoose)
### User (`user.model.js`)
- `name`, `email` (unique), `password`, `phone`
- `role` (enum: `user`), `isActive`
- Timestamps: `createdAt` only

### Lawyer (`lawyer.model.js`)
- `name`, `email` (unique), `password`, `profileImage`, `phone`
- `location` (address, city, state)
- `education[]` (degree, university, year)
- `licenseNo` (unique)
- `specializations[]` (enum: Criminal, Civil, Corporate, Family, Property)
- `feesByCategory[]` (category + fee)
- `experience`, `rating`, `totalReviews`, `availability`, `verification`, `isActive`
- Timestamps: `createdAt` only

### Appointment (`appointment.model.js`)
- `userId` (User ref), `lawyerId` (Lawyer ref)
- `lawyerName`, `lawyerSpecialization`
- `caseCategory` (enum), `caseDescription`
- `date`, `timeSlot`, `feeCharged`
- `status` (Pending/Approved/Rejected/Completed), `isActive`
- Unique index on (`lawyerId`, `date`, `timeSlot`)

### Availability (`availability.model.js`)
- `lawyerId` (Lawyer ref), `date`
- `slots[]` (time, isBooked)
- Unique index on (`lawyerId`, `date`)

### Payment (`payment.model.js`)
- `appointmentId` (Appointment ref, unique)
- `transactionId` (unique), `amount`
- `paymentStatus` (Success/Failed), `paymentMode` (UPI/Card/NetBanking)
- Timestamps: `createdAt` only

### Review (`review.model.js`)
- `userId` (User ref), `lawyerId` (Lawyer ref)
- `rating` (1-5), `comment`
- Unique index on (`userId`, `lawyerId`)

### Notification (`notification.model.js`)
- `appointmentId` (Appointment ref), `userId` (User ref), `lawyerId` (Lawyer ref)
- `notificationMsg`, `isRead`
- Indexes on `userId`, `lawyerId`, `createdAt`

### Cancellation (`cancellation.model.js`)
- `appointmentId` (Appointment ref, unique)
- `userId` (User ref), `lawyerId` (Lawyer ref)
- Timestamps: `createdAt` only

### Admin (`admin.model.js`)
- `name`, `email` (unique), `password`
- `role` (enum: `admin`)

## Developer Guide (Best Practices)
- Keep models in `server/src/models/` and route handlers in `server/src/controllers/`.
- Add API routes under `server/src/routes/` and mount them in `server.js`.
- Use `server/src/validations/` for request validation schemas.
- Prefer environment variables for secrets and connection strings.
- Add consistent error handling middleware in `server/src/middlewares/`.
- Use DTOs or service layer in `server/src/services/` when business logic grows.

## Roadmap Ideas
- Connect MongoDB and implement CRUD routes.
- Authentication and role-based access (client, lawyer, admin).
- Appointment scheduling with availability checks.
- Payments integration and status tracking.
- Notifications (email/SMS/in-app).
- Admin dashboard and analytics.

## Scripts
### Client
- `npm run dev` - start Vite dev server
- `npm run build` - build production assets
- `npm run preview` - preview build
- `npm run lint` - lint client code

### Server
- `npm test` - placeholder (no tests yet)

## Contributing
- Keep commits small and focused.
- Add tests when introducing new behavior.
- Update this README when you add new endpoints or env vars.
