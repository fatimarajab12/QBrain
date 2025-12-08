// pages/auth/components/Login.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/types/auth";
import { validateEmail } from "@/utils/auth-helpers";
import AuthLayout from "./AuthLayout";

interface LoginProps {
  onSwitchToSignup: () => void;
}

const Login = ({ onSwitchToSignup }: LoginProps) => {
  const { toast } = useToast();
  const { login, forgotPassword, isLoading, error, setError } = useAuth();
  
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

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

  const handleForgotPassword = async () => {
    if (!loginForm.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(loginForm.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    await forgotPassword(loginForm.email);
  };

  const updateLoginForm = (field: keyof LoginForm, value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };


  return (
    <AuthLayout title="Welcome back" description="Sign in to your account to continue">
      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
              {error}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={loginForm.email}
            onChange={(e) => updateLoginForm("email", e.target.value)}
            required
            disabled={isLoading}
            className="h-11 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-200"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-foreground/90">
              Password
            </Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors disabled:opacity-50 font-medium"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={loginForm.password}
            onChange={(e) => updateLoginForm("password", e.target.value)}
            required
            disabled={isLoading}
            className="h-11 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-200"
          />
        </div>
        
        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-[1.02] font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Switch to signup */}
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-cyan-500 hover:text-cyan-400 font-semibold hover:underline transition-colors"
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