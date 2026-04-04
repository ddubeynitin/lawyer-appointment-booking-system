import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import "./App.css";
import LoadingFallback from "./components/LoadingFallback";
import LawyerCardSkeleton from "./components/layout/LawyerCardSkeleton";
import AiChatWidget from "./components/ai/AiChatWidget";

// Lazy load components

const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const AppointmentSchedulingPage = lazy(() => import("./pages/client/AppointmentSchedulingPage"));
const AppointmentRequestsPage = lazy(() => import("./pages/lawyer/AppointmentRequestsPage"));
const LawyerCalendarPage = lazy(() => import("./pages/lawyer/LawyerCalendarPage"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));

const Registration = lazy(() => import("./pages/auth/Register"));
const ClientDashboard = lazy(() => import("./pages/client/ClientDasshboard"));
const AdminDashBoard = lazy(() => import("./pages/admin/AdminDashBoard"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const LawyerDashboard = lazy(() => import("./pages/lawyer/LawyerDashboard"));
const LawyerEarningsPage = lazy(() => import("./pages/lawyer/LawyerEarningsPage"));
const ManageAvailabilityAndFees = lazy(() => import("./pages/lawyer/ManageAvailabilityAndFees"));
const EditLawyerProfile = lazy(() => import("./pages/lawyer/EditLawyerProfile"));
const LawyersList = lazy(() => import("./pages/client/LawyersList"));
const MyAppointments = lazy(() => import("./pages/client/MyAppointments"));
const Home = lazy(() => import("./pages/Home"));
const CompleteLawyerProfile = lazy(
  () => import("./pages/auth/CompleteLawyerProfile"),
);
const LawyerProfile = lazy(() => import("./pages/lawyer/LawyerProfile"));
const MessagesPage = lazy(() => import("./pages/messages/MessagesPage"));

const App = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Router>
        <Routes>
          <Route path="*" element={<PageNotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs/>} />
          <Route path="/contact" element={<ContactUs/>} />

          <Route path="/complete-profile" element={<CompleteLawyerProfile />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<Registration />} />

          <Route
            path="/client/client-dashboard"
            element={<ClientDashboard />}
          />
          <Route
            path="/client/appointment-scheduling/:id"
            element={<AppointmentSchedulingPage/>}
          />
          <Route
            path="/client/appointment-history"
            element={<MyAppointments />}
          />
          <Route path="/client/lawyer-list" element={<LawyersList />} />

          <Route
            path="/lawyer/lawyer-dashboard"
            element={<LawyerDashboard />}
          />
          <Route
            path="/lawyer/earnings"
            element={<LawyerEarningsPage />}
          />
          <Route
            path="/lawyer/appointment-requests"
            element={<AppointmentRequestsPage/>}
          />
          <Route
            path="/lawyer/calendar"
            element={<LawyerCalendarPage />}
          />
          <Route
            path="/lawyer/manage-availability"
            element={<ManageAvailabilityAndFees />}
          />
          <Route
            path="/lawyer/edit-profile"
            element={<EditLawyerProfile />}
          />
          <Route path="/lawyer/lawyer-profile/:id" element={<LawyerProfile />} />
          <Route path="/messages" element={<MessagesPage />} />

          <Route path="/admin/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin/admin-dashboard" element={<AdminDashBoard />} />
          <Route path="/admin/manage-users" element={<div>Manage Users</div>} />
          <Route
            path="/admin/manage-lawyers"
            element={<LawyerCardSkeleton /> || <div>Manage Lawyers</div>}
          />
        </Routes>
        <AiChatWidget />
      </Router>
    </Suspense>
  );
};

export default App;
