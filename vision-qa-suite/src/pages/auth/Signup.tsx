// pages/auth/components/Signup.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { SignupForm } from "@/types/auth";
import { validateEmail, validatePassword, validateName } from "@/utils/auth-helpers";
import AuthLayout from "./AuthLayout";

interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup = ({ onSwitchToLogin }: SignupProps) => {
  const { signup, isLoading, error, setError } = useAuth();
  
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
      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="signup-name">Full Name</Label>
          <Input
            id="signup-name"
            type="text"
            placeholder="John Doe"
            value={signupForm.name}
            onChange={(e) => updateSignupForm("name", e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            value={signupForm.email}
            onChange={(e) => updateSignupForm("email", e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={signupForm.password}
            onChange={(e) => updateSignupForm("password", e.target.value)}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Password must be at least 6 characters long
          </p>
        </div>
        
        <Button
          type="submit"
          className="w-full gradient-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>

        {/* Switch to login */}
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;