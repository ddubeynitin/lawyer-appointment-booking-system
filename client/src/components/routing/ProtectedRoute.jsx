import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const getRoleHome = (role) => {
  switch (role) {
    case "admin":
      return "/admin/admin-dashboard";
    case "lawyer":
      return "/lawyer/lawyer-dashboard";
    case "user":
      return "/client/client-dashboard";
    default:
      return "/";
  }
};

const isProfileComplete = (user) =>
  Boolean(user?.isProfileComplete ?? user?.idProfileComplete);

const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = "/auth/login",
  requireIncompleteProfile = false,
  requireCompleteProfile = false,
}) => {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={getRoleHome(user.role)} replace />;
    }
  }

  if (requireIncompleteProfile && user.role === "lawyer" && isProfileComplete(user)) {
    return <Navigate to="/lawyer/lawyer-dashboard" replace />;
  }

  if (requireCompleteProfile && user.role === "lawyer" && !isProfileComplete(user)) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
