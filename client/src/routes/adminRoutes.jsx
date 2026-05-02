import React, { lazy } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/routing/ProtectedRoute";

const AdminDashBoard = lazy(() => import("../pages/admin/AdminDashBoard"));
const AdminLoginPage = lazy(() => import("../pages/admin/AdminLoginPage"));
const AppointmentBooked = lazy(
  () => import("../components/appointment/AppointmentBooked"),
);

export const adminRoutes = [
  <Route key="admin-login" path="/admin/admin-login" element={<AdminLoginPage />} />,
  <Route
    key="admin-dashboard"
    path="/admin/admin-dashboard"
    element={
      <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/admin-login">
        <AdminDashBoard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin-manage-users"
    path="/admin/manage-users"
    element={
      <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/admin-login">
        <div>Manage Users</div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin-manage-lawyers"
    path="/admin/manage-lawyers"
    element={
      <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/admin-login">
        <AppointmentBooked />
      </ProtectedRoute>
    }
  />,
];
