import React, { lazy } from "react";
import { Route } from "react-router-dom";

const PageNotFound = lazy(() => import("../pages/PageNotFound"));
const AboutUs = lazy(() => import("../pages/AboutUs"));
const ContactUs = lazy(() => import("../pages/ContactUs"));
const Home = lazy(() => import("../pages/Home"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const Registration = lazy(() => import("../pages/auth/Register"));
const LawyersList = lazy(() => import("../pages/client/LawyersList"));
const LawyerProfile = lazy(() => import("../pages/lawyer/LawyerProfile"));

export const publicRoutes = [
  <Route key="home" path="/" element={<Home />} />,
  <Route key="about" path="/about" element={<AboutUs />} />,
  <Route key="contact" path="/contact" element={<ContactUs />} />,
  <Route key="auth-login" path="/auth/login" element={<LoginPage />} />,
  <Route key="auth-register" path="/auth/register" element={<Registration />} />,
  <Route key="lawyers-list" path="/client/lawyer-list" element={<LawyersList />} />,
  <Route
    key="lawyer-profile"
    path="/lawyer/lawyer-profile/:id"
    element={<LawyerProfile />}
  />,
  <Route key="not-found" path="*" element={<PageNotFound />} />,
];
