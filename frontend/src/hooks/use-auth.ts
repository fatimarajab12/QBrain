import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { LoginForm, SignupForm, User } from '@/types/auth';
import { authService } from '@/services/auth.service';
import { authStorage } from '@/utils/auth-helpers';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    // Hydrate user from storage, then refresh from backend (ensures role is up-to-date)
    const init = async () => {
      try {
        const savedUser = authStorage.getUser();
        if (savedUser && isMounted) {
          setUser(savedUser);
        }

        if (authStorage.isAuthenticated()) {
          const fresh = await authService.getProfile();
          if (isMounted) {
            authStorage.setUser(fresh);
            setUser(fresh);
          }
        } else {
          // Ensure initialization is always async, even when not authenticated
          await Promise.resolve();
        }
      } catch (e) {
        // If token is invalid/expired, clear and force re-login
        if (isMounted) {
          authStorage.clear();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    init();
    
    // Listen for unauthorized events from apiClient
    const handleUnauthorized = () => {
      if (isMounted) {
        authStorage.clear();
        setUser(null);
        navigate('/login');
      }
    };
    
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  const login = useCallback(async (credentials: LoginForm) => {
    // Prevent concurrent login attempts
    if (isLoading) {
      return;
    }
    
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
  }, [isLoading, navigate, toast]);

  const signup = useCallback(async (userData: SignupForm) => {
    // Prevent concurrent signup attempts
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.signup(userData);
      
      // Don't store token or user - user must verify email first
      // Don't authenticate the user until email is verified

      // Show verification message
      if (response.verificationToken) {
        // Development mode - show token
        toast({
          title: "Account Created Successfully",
          description: `Please check your email to verify your account. Verification token: ${response.verificationToken}`,
          duration: 10000,
        });
      } else {
        toast({
          title: "Account Created Successfully",
          description: "Please check your email to verify your account. After verification, you can sign in.",
          duration: 8000,
        });
      }

      // Navigate to login page with email pre-filled
      navigate("/login", { 
        state: { 
          email: userData.email,
          message: "Account created! Please verify your email before signing in." 
        } 
      });
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
  }, [isLoading, navigate, toast]);

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
    setError(null);
    
    try {
      const response = await authService.forgotPassword(email);
      toast({
        title: "Password Reset Code Sent",
        description: "Check your email for the 4-digit reset code. The code expires in 10 minutes.",
        duration: 5000,
      });
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset email.";
      setError(errorMessage);
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (resetData: { email: string; code: string; newPassword: string; confirmPassword: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.resetPassword(resetData);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully. You can now sign in with your new password.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password.";
      setError(errorMessage);
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize isAuthenticated to avoid recalculating on every render
  const isAuthenticated = useMemo(() => {
    return !!user && authStorage.isAuthenticated();
  }, [user]);

  return {
    user,
    isLoading,
    isInitializing,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated,
    setError
  };
};
