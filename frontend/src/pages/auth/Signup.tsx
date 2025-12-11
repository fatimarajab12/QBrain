// pages/auth/components/Signup.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { SignupForm } from "@/types/auth";
import { validateEmail, validatePassword, validateName } from "@/utils/auth-helpers";
import AuthLayout from "./AuthLayout";

interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup = ({ onSwitchToLogin }: SignupProps) => {
  const { signup, isLoading, error, setError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const [signupForm, setSignupForm] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateName(signupForm.name)) {
      setError("Name must be at least 2 characters long");
      return;
    }

    if (!validateEmail(signupForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(signupForm.password)) {
      setError("Password must be at least 6 characters long");
      return;
    }

    await signup(signupForm);
  };

  const updateSignupForm = (field: keyof SignupForm, value: string) => {
    setSignupForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <AuthLayout 
      title="Create account" 
      description="Create your account to get started"
    >
      <form onSubmit={handleSignup} className="space-y-5">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              {error}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="signup-name" className="text-sm font-semibold text-foreground">
            Full Name
          </Label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-cyan-500 transition-colors duration-200" />
            <Input
              id="signup-name"
              type="text"
              placeholder="John Doe"
              value={signupForm.name}
              onChange={(e) => updateSignupForm("name", e.target.value)}
              required
              disabled={isLoading}
              className="h-12 pl-10 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg hover:border-cyan-400/50"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
            Email Address
          </Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-cyan-500 transition-colors duration-200" />
            <Input
              id="signup-email"
              type="email"
              placeholder="name@example.com"
              value={signupForm.email}
              onChange={(e) => updateSignupForm("email", e.target.value)}
              required
              disabled={isLoading}
              className="h-12 pl-10 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg hover:border-cyan-400/50"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground">
            Password
          </Label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-cyan-500 transition-colors duration-200" />
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={signupForm.password}
              onChange={(e) => updateSignupForm("password", e.target.value)}
              required
              disabled={isLoading}
              className="h-12 pl-10 pr-10 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg hover:border-cyan-400/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-cyan-500 transition-colors p-1 rounded-md hover:bg-cyan-50 dark:hover:bg-cyan-950/20"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground pl-1">
            Password must be at least 6 characters long
          </p>
        </div>
        
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-[1.02] font-bold text-base rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        {/* Switch to login */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-cyan-600 hover:text-cyan-500 font-bold hover:underline transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;