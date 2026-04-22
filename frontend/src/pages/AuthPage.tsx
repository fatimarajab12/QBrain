import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";

const AuthPage = () => {
  const location = useLocation();
  const [currentView, setCurrentView] = useState<"login" | "signup">("login");

  // If coming from reset password, ensure we show login view
  useEffect(() => {
    if (location.state?.resetSuccess || location.state?.email) {
      setCurrentView("login");
    }
  }, [location.state]);

  return (
    <>
      {currentView === "login" && (
        <Login 
          onSwitchToSignup={() => setCurrentView("signup")} 
          initialEmail={location.state?.email}
        />
      )}
      {currentView === "signup" && (
        <Signup onSwitchToLogin={() => setCurrentView("login")} />
      )}
    </>
  );
};

export default AuthPage;
