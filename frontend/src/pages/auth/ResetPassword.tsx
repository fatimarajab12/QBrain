import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Label } from "@/components/ui/label";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth.service";
import { validateEmail, validatePassword } from "@/utils/auth-helpers";
import AuthLayout from "./AuthLayout";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get email from location state or use empty string
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 4).split("");
        const newCode = [...code];
        digits.forEach((digit, i) => {
          if (i < 4) newCode[i] = digit;
        });
        setCode(newCode);
        if (digits.length === 4) {
          inputRefs.current[3]?.focus();
        } else if (digits.length > 0) {
          inputRefs.current[digits.length]?.focus();
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const codeString = code.join("");
    if (codeString.length !== 4) {
      setError("Please enter the complete 4-digit code");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        code: codeString,
        newPassword,
        confirmPassword,
      });

      // Clear any old authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');

      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully. You can now sign in with your new password.",
      });

      // Navigate to login page with email in state
      navigate("/auth", { 
        replace: true,
        state: { email, resetSuccess: true }
      });
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to reset password. Please try again.";
      setError(errorMessage);
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      description="Enter the 4-digit code sent to your email and your new password"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
              {error}
            </div>
          </div>
        )}
        
        {/* Email field (if not provided in state) */}
        {!location.state?.email && (
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              required
              disabled={isLoading}
              className="h-11 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-200"
            />
          </div>
        )}

        {/* Code input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground/90">
            4-Digit Reset Code
          </Label>
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                disabled={isLoading}
                className="h-14 w-14 text-center text-2xl font-bold border-2 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200"
                required
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Enter the 4-digit code sent to your email
          </p>
        </div>

        {/* New Password */}
        <div className="space-y-2.5">
          <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
            New Password
          </Label>
          <InputWithIcon
            id="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError(null);
            }}
            required
            disabled={isLoading}
            leftIcon={KeyRound}
            rightIcon={showPassword ? EyeOff : Eye}
            rightIconButton={true}
            onRightIconClick={() => setShowPassword(!showPassword)}
            className="h-12 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg hover:border-cyan-400/50 bg-background"
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-2.5">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
            Confirm Password
          </Label>
          <InputWithIcon
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError(null);
            }}
            required
            disabled={isLoading}
            leftIcon={KeyRound}
            rightIcon={showConfirmPassword ? EyeOff : Eye}
            rightIconButton={true}
            onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="h-12 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg hover:border-cyan-400/50 bg-background"
          />
        </div>
        
        <LoadingButton
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-400 text-white font-bold text-base rounded-lg shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-0"
          isLoading={isLoading}
          loadingText="Resetting password..."
        >
          Reset Password
        </LoadingButton>

        {/* Back to login */}
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/auth")}
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

export default ResetPassword;

