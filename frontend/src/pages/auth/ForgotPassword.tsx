import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { validateEmail } from "@/utils/auth-helpers";
import AuthLayout from "./AuthLayout";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { forgotPassword, isLoading, error, setError } = useAuth();
  
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const response = await forgotPassword(email);
      
      // Navigate to reset password page with email
      navigate("/reset-password", { 
        state: { email },
        replace: true 
      });
      
      toast({
        title: "Code Sent",
        description: "Check your email for the 4-digit reset code. The code expires in 10 minutes.",
        duration: 5000,
      });
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      description="Enter your email address and we'll send you a reset code"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
            Email Address
          </Label>
          <InputWithIcon
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
            leftIcon={Mail}
            className="h-12 border-border/50 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg hover:border-cyan-400/50 bg-background"
          />
        </div>
        
        <LoadingButton
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-400 text-white font-bold text-base rounded-lg shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-0"
          isLoading={isLoading}
          loadingText="Sending code..."
        >
          Send Reset Code
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

export default ForgotPassword;

