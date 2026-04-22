import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/types/auth";
import { validateEmail } from "@/utils/auth-helpers";
import AuthLayout from "./AuthLayout";

interface LoginProps {
  onSwitchToSignup: () => void;
  initialEmail?: string;
}

const Login = ({ onSwitchToSignup, initialEmail }: LoginProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isLoading, error, setError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: initialEmail || location.state?.email || "",
    password: "",
  });

  // Show success message if coming from password reset
  useEffect(() => {
    if (location.state?.resetSuccess) {
      toast({
        title: "Password Reset Successful",
        description: "You can now sign in with your new password.",
      });
      // Clear the state to prevent showing the message again
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // Show message if coming from signup
  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: "Account Created",
        description: location.state.message,
        duration: 8000,
      });
      // Clear the state to prevent showing the message again
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // Update email if initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      setLoginForm(prev => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!loginForm.email || !loginForm.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(loginForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (loginForm.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    await login(loginForm);
  };


  const updateLoginForm = (field: keyof LoginForm, value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };


  return (
    <AuthLayout title="Welcome back" description="Sign in to your account to continue">
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              {error}
            </div>
          </div>
        )}
        
        <div className="space-y-2.5">
          <Label htmlFor="email" className="text-sm font-semibold text-foreground">
            Email Address *
          </Label>
          <InputWithIcon
            id="email"
            type="email"
            placeholder="name@example.com"
            value={loginForm.email}
            onChange={(e) => updateLoginForm("email", e.target.value)}
            required
            disabled={isLoading}
            leftIcon={Mail}
            className="h-12 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg hover:border-cyan-400/50 bg-background"
          />
        </div>
        
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold text-foreground">
              Password *
            </Label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors disabled:opacity-50 font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded px-1"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>
          <InputWithIcon
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={loginForm.password}
            onChange={(e) => updateLoginForm("password", e.target.value)}
            required
            disabled={isLoading}
            leftIcon={Lock}
            rightIcon={showPassword ? EyeOff : Eye}
            rightIconButton={true}
            onRightIconClick={() => setShowPassword(!showPassword)}
            className="h-12 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg hover:border-cyan-400/50 bg-background"
          />
        </div>
        
        <LoadingButton
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-400 text-white font-bold text-base rounded-lg shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-0"
          isLoading={isLoading}
          loadingText="Signing in..."
        >
          Sign In
        </LoadingButton>

        {/* Switch to signup */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-cyan-500 hover:text-cyan-400 font-bold hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded px-1"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
