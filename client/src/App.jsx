import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import "./App.css";
import LoadingFallback from "./components/LoadingFallback";
import PageNotFound from "./pages/PageNotFound";
import LawyerCardSkeleton from "./components/layout/LawyerCardSkeleton";
import AppointmentSchedulingPage from "./pages/client/AppointmentSchedulingPage";
import AppointmentRequestsPage from "./pages/lawyer/AppointmentRequestsPage";
import LawyerCalendarPage from "./pages/lawyer/LawyerCalendarPage";
import AiChatWidget from "./components/ai/AiChatWidget";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

// Lazy load components
const Registration = lazy(() => import("./pages/auth/Register"));
const ClientDashboard = lazy(() => import("./pages/client/ClientDasshboard"));
const AdminDashBoard = lazy(() => import("./pages/admin/AdminDashBoard"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const LawyerDashboard = lazy(() => import("./pages/lawyer/LawyerDashboard"));
const LawyersList = lazy(() => import("./pages/client/LawyersList"));
const MyAppointments = lazy(() => import("./pages/client/MyAppointments"));
const Home = lazy(() => import("./pages/Home"));
const CompleteLawyerProfile = lazy(
  () => import("./pages/auth/CompleteLawyerProfile"),
);
const AppointmentConfirmation = lazy(
  () => import("./pages/client/AppointmentConfirmation"),
);
const LawyerProfile = lazy(() => import("./pages/lawyer/LawyerProfile"));

const App = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Router>
        <Routes>
          <Route path="*" element={<PageNotFound/>} />
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
            path="/lawyer/appointment-requests"
            element={<AppointmentRequestsPage/>}
          />
          <Route
            path="/lawyer/calendar"
            element={<LawyerCalendarPage />}
          />
          <Route path="/lawyer/lawyer-profile/:id" element={<LawyerProfile />} />

          <Route path="/admin/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin/admin-dashboard" element={<AdminDashBoard />} />
          <Route path="/admin/manage-users" element={<div>Manage Users</div>} />
          <Route
            path="/admin/manage-lawyers"
            element={<LawyerCardSkeleton/>||<div>Manage Lawyers</div>}
          />
        </Routes>
        <AiChatWidget />
      </Router>
    </Suspense>
  );
};

export default App;
