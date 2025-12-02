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
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/types/auth";
import { validateEmail } from "@/utils/auth-helpers";
import PixelBlast from "@/components/custom/DotGrid";
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
    
    // Validation
    if (!loginForm.email || !loginForm.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(loginForm.email)) {
      setError("Please enter a valid email address");
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

  const handleDemoLogin = async () => {
    setLoginForm({
      email: "demo@qa.com",
      password: "demo123"
    });
    
    // Auto-submit after a brief delay to show the filled fields
    setTimeout(() => {
      const form = document.querySelector<HTMLFormElement>('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 500);
  };

  return (
    <AuthLayout title="Welcome back" description="Sign in to your account to continue">
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={loginForm.email}
            onChange={(e) => updateLoginForm("email", e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={loginForm.password}
            onChange={(e) => updateLoginForm("password", e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        {/* Demo credentials button */}
        

        {/* Switch to signup */}
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;