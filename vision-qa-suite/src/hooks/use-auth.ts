// hooks/use-auth.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { LoginForm, SignupForm, User } from '@/types/auth';
import { authService } from '@/services/auth.service';
import { authStorage } from '@/utils/auth-helpers';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = authStorage.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = async (credentials: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error("Please fill in all fields");
      }

      const response = await authService.login(credentials);
      
      // Store authentication data
      authStorage.setToken(response.token);
      authStorage.setUser(response.user);
      setUser(response.user);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.name || response.user.email}!`,
      });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
      
      // Show toast only for non-validation errors
      if (!errorMessage.includes("Please fill")) {
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.signup(userData);
      
      authStorage.setToken(response.token);
      authStorage.setUser(response.user);
      setUser(response.user);

      // Store userId if available
      if (response.user.id) {
        localStorage.setItem('userId', response.user.id);
      }

      // Show verification message if token is provided (development mode)
      if (response.verificationToken) {
        toast({
          title: "Account Created",
          description: `Welcome to QBrain! Please check your email to verify your account. Verification token: ${response.verificationToken}`,
          duration: 10000,
        });
      } else {
        toast({
          title: "Account Created",
          description: "Welcome to QBrain! Please check your email to verify your account.",
        });
      }

      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed. Please try again.";
      setError(errorMessage);
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authStorage.clear();
      setUser(null);
      navigate("/");
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      await authService.forgotPassword(email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for reset instructions.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset email.";
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    isAuthenticated: authStorage.isAuthenticated(),
    setError
  };
};