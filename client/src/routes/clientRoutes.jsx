import React, { lazy } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/routing/ProtectedRoute";

const ClientDashboard = lazy(() => import("../pages/client/ClientDasshboard"));
const AppointmentSchedulingPage = lazy(
  () => import("../pages/client/AppointmentSchedulingPage"),
);
const MyAppointments = lazy(() => import("../pages/client/MyAppointments"));
const MessagesPage = lazy(() => import("../pages/messages/MessagesPage"));

export const clientRoutes = [
  <Route
    key="client-dashboard"
    path="/client/client-dashboard"
    element={
      <ProtectedRoute allowedRoles={["user"]}>
        <ClientDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="client-appointment-scheduling"
    path="/client/appointment-scheduling/:id"
    element={
      <ProtectedRoute allowedRoles={["user"]}>
        <AppointmentSchedulingPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="client-appointment-history"
    path="/client/appointment-history"
    element={
      <ProtectedRoute allowedRoles={["user"]}>
        <MyAppointments />
      </ProtectedRoute>
    }
  />,
  <Route
    key="messages"
    path="/messages"
    element={
      <ProtectedRoute allowedRoles={["user", "lawyer"]}>
        <MessagesPage />
      </ProtectedRoute>
    }
  />,
];
