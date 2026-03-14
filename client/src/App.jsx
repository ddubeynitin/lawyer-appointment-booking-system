import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import "./App.css";
import LoadingFallback from "./components/LoadingFallback";
import PageNotFound from "./pages/PageNotFound";
import CustomCursor from "./components/layout/CustomCursor";

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
      <CustomCursor/>
      <Router>
        <Routes>
          <Route path="*" element={<PageNotFound/>} />
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<Registration />} />
          <Route path="/complete-profile" element={<CompleteLawyerProfile />} />

          <Route
            path="/client/client-dashboard"
            element={<ClientDashboard />}
          />
          <Route
            path="/client/appointment-scheduling"
            element={<MyAppointments />}
          />
          <Route
            path="/client/appointment-confirmation"
            element={<AppointmentConfirmation />}
          />
          <Route path="/client/lawyer-list" element={<LawyersList />} />

          <Route
            path="/lawyer/lawyer-dashboard"
            element={<LawyerDashboard />}
          />
          <Route path="/lawyer/lawyer-profile" element={<LoadingFallback/>} />

          <Route path="/admin/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin/admin-dashboard" element={<AdminDashBoard />} />
          <Route path="/admin/manage-users" element={<div>Manage Users</div>} />
          <Route
            path="/admin/manage-lawyers"
            element={<div>Manage Lawyers</div>}
          />
        </Routes>
      </Router>
    </Suspense>
  );
};

export default App;
