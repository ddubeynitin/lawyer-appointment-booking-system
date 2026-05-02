import { BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import React, { Suspense } from "react";
import "./App.css";
import LoadingFallback from "./components/LoadingFallback";
import AiChatWidget from "./components/ai/AiChatWidget";
import { AuthProvider } from "./context/AuthContext";
import { publicRoutes } from "./routes/publicRoutes";
import { clientRoutes } from "./routes/clientRoutes";
import { lawyerRoutes } from "./routes/lawyerRoutes";
import { adminRoutes } from "./routes/adminRoutes";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

const AppShell = () => {
  const location = useLocation();
  const hideAiChat =
    location.pathname.startsWith("/auth") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/messages") ||
    location.pathname.startsWith("/complete-profile");

  return (
    <>
      <ScrollToTop />
      <Routes>
        {publicRoutes}
        {clientRoutes}
        {lawyerRoutes}
        {adminRoutes}
      </Routes>
      {!hideAiChat ? <AiChatWidget /> : null}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Router>
          <AppShell />
        </Router>
      </Suspense>
    </AuthProvider>
  );
};

export default App;
