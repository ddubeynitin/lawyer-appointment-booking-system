import React, { lazy } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/routing/ProtectedRoute";

const AppointmentRequestsPage = lazy(
  () => import("../pages/lawyer/AppointmentRequestsPage"),
);
const LawyerCalendarPage = lazy(
  () => import("../pages/lawyer/LawyerCalendarPage"),
);
const LawyerDashboard = lazy(() => import("../pages/lawyer/LawyerDashboard"));
const LawyerAppointmentsPage = lazy(
  () => import("../pages/lawyer/LawyerAppointmentsPage"),
);
const LawyerEarningsPage = lazy(
  () => import("../pages/lawyer/LawyerEarningsPage"),
);
const ManageAvailabilityAndFees = lazy(
  () => import("../pages/lawyer/ManageAvailabilityAndFees"),
);
const EditLawyerProfile = lazy(
  () => import("../pages/lawyer/EditLawyerProfile"),
);
const LawyerAccountSettings = lazy(
  () => import("../pages/lawyer/LawyerAccountSettings"),
);
const CompleteLawyerProfile = lazy(
  () => import("../pages/auth/CompleteLawyerProfile"),
);

export const lawyerRoutes = [
  <Route
    key="complete-profile"
    path="/complete-profile"
    element={
      <ProtectedRoute allowedRoles={["lawyer"]} requireIncompleteProfile>
        <CompleteLawyerProfile />
      </ProtectedRoute>
    }
  />,
  <Route
    key="lawyer-dashboard"
    path="/lawyer/lawyer-dashboard"
    element={
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <LawyerDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="lawyer-appointments"
    path="/lawyer/appointments"
    element={
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <LawyerAppointmentsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="lawyer-earnings"
    path="/lawyer/earnings"
    element={
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <LawyerEarningsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="lawyer-appointment-requests"
    path="/lawyer/appointment-requests"
    element={
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <AppointmentRequestsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="lawyer-calendar"
    path="/lawyer/calendar"
    element={
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <LawyerCalendarPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="lawyer-manage-availability"
    path="/lawyer/manage-availability"
    element={
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <ManageAvailabilityAndFees />
      </ProtectedRoute>
    }
  />,
  <Route
    key="lawyer-edit-profile"
    path="/lawyer/edit-profile"
    element={
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <EditLawyerProfile />
      </ProtectedRoute>
    }
  />,
  <Route
    key="lawyer-account-settings"
    path="/lawyer/account-settings"
    element={
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <LawyerAccountSettings />
      </ProtectedRoute>
    }
  />,
];
