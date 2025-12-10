// pages/auth/ForgotPassword.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
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
      <form onSubmit={handleSubmit} className="space-y-5">
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
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              className="h-11 pl-10 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-200"
            />
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-[1.02] font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending code...
            </>
          ) : (
            "Send Reset Code"
          )}
        </Button>

        {/* Back to login */}
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="text-cyan-500 hover:text-cyan-400 font-semibold hover:underline transition-colors"
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

