// pages/auth/AuthPage.tsx
import { useState } from "react";
import Login from "./auth/Login";
import Signup from "./auth/Signup";

const AuthPage = () => {
  const [currentView, setCurrentView] = useState<"login" | "signup">("login");

  return (
    <>
      {currentView === "login" && (
        <Login onSwitchToSignup={() => setCurrentView("signup")} />
      )}
      {currentView === "signup" && (
        <Signup onSwitchToLogin={() => setCurrentView("login")} />
      )}
    </>
  );
};

export default AuthPage;