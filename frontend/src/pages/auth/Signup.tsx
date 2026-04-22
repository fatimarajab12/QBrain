import { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
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
      <form onSubmit={handleSignup} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              {error}
            </div>
          </div>
        )}
        
        <div className="space-y-2.5">
          <Label htmlFor="signup-name" className="text-sm font-semibold text-foreground">
            Full Name *
          </Label>
          <InputWithIcon
            id="signup-name"
            type="text"
            placeholder="John Doe"
            value={signupForm.name}
            onChange={(e) => updateSignupForm("name", e.target.value)}
            required
            disabled={isLoading}
            leftIcon={User}
            className="h-12 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg hover:border-cyan-400/50 bg-background"
          />
        </div>
        
        <div className="space-y-2.5">
          <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
            Email Address *
          </Label>
          <InputWithIcon
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            value={signupForm.email}
            onChange={(e) => updateSignupForm("email", e.target.value)}
            required
            disabled={isLoading}
            leftIcon={Mail}
            className="h-12 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg hover:border-cyan-400/50 bg-background"
          />
        </div>
        
        <div className="space-y-2.5">
          <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground">
            Password *
          </Label>
          <InputWithIcon
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={signupForm.password}
            onChange={(e) => updateSignupForm("password", e.target.value)}
            required
            disabled={isLoading}
            leftIcon={Lock}
            rightIcon={showPassword ? EyeOff : Eye}
            rightIconButton={true}
            onRightIconClick={() => setShowPassword(!showPassword)}
            className="h-12 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg hover:border-cyan-400/50 bg-background"
          />
          <p className="text-xs text-muted-foreground pl-1 mt-1.5">
            Password must be at least 6 characters long
          </p>
        </div>
        
        <LoadingButton
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-400 text-white font-bold text-base rounded-lg shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-0"
          isLoading={isLoading}
          loadingText="Creating account..."
        >
          Create Account
        </LoadingButton>

        {/* Switch to login */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-cyan-500 hover:text-cyan-400 font-bold hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded px-1"
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
