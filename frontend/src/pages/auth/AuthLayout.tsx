// pages/auth/components/AuthLayout.tsx
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import PixelBlast from "@/components/custom/DotGrid";
import Logo from "@/components/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

const AuthLayout = ({ children, title, description }: AuthLayoutProps) => {
  return (
    <>
      <style>{authStyles}</style>
      <div
        className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden"
        style={{ fontFamily: "var(--font-arabic)" }}
      >
      {/* Enhanced Background with gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Animated gradient overlays */}
        <div 
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(34,211,238,0.2), transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(59,130,246,0.15), transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(99,102,241,0.1), transparent 60%)
            `,
            backgroundSize: '200% 200%',
            animation: 'gradientShift 15s ease infinite'
          }}
        />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float-slow-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* PixelBlast with improved colors */}
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#22d3ee"
          patternScale={3}
          patternDensity={1.0}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.3}
          rippleThickness={0.12}
          rippleIntensityScale={1.2}
          liquid
          liquidStrength={0.1}
          liquidRadius={1.2}
          liquidWobbleSpeed={4}
          speed={0.5}
          edgeFade={0.3}
          transparent
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Back to home */}
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-all duration-200 hover:translate-x-[-2px] group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-[-2px] transition-transform" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-center mb-8 animate-in fade-in duration-700 delay-100 hover:scale-105 transition-transform">
            <Logo size={48} showText={true} textSize="lg" />
          </div>

          <Card className="shadow-2xl border-cyan-500/30 backdrop-blur-xl bg-background/95 hover:shadow-cyan-500/30 hover:border-cyan-500/50 transition-all duration-500 rounded-2xl overflow-hidden group">
            {/* Animated gradient top border */}
            <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
            
            <CardHeader className="space-y-3 text-center pb-8 pt-8">
              <CardTitle
                className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {title}
              </CardTitle>
              <CardDescription
                className="text-base text-muted-foreground/80 leading-relaxed"
                style={{ fontFamily: "var(--font-arabic)" }}
              >
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              {children}
              
              {/* Terms and Privacy */}
              <div className="mt-8 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground leading-relaxed">
                By continuing, you agree to our{" "}
                <a href="#" className="text-cyan-600 hover:text-cyan-500 hover:underline transition-colors font-medium">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-cyan-600 hover:text-cyan-500 hover:underline transition-colors font-medium">Privacy Policy</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};
export default AuthLayout;

// Add custom animations to index.css or create a style tag
const authStyles = `
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes float-slow {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }
  
  @keyframes float-slow-delayed {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-30px, 30px) scale(0.9); }
    66% { transform: translate(20px, -20px) scale(1.1); }
  }
  
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-gradient-shift {
    animation: gradientShift 15s ease infinite;
  }
  
  .animate-float-slow {
    animation: float-slow 20s ease-in-out infinite;
  }
  
  .animate-float-slow-delayed {
    animation: float-slow-delayed 25s ease-in-out infinite;
    animation-delay: -5s;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 8s ease-in-out infinite;
  }
  
  .animate-shimmer {
    animation: shimmer 3s linear infinite;
  }
`;