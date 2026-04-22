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
import GlitchText from "@/components/custom/GlitchText";
import LightPillar from "@/components/custom/LightPillar";

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
        className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{ fontFamily: "var(--font-arabic)" }}
      >
      {/* Enhanced Background with gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* LightPillar background */}
        <LightPillar
          topColor="#22d3ee"
          bottomColor="#6366f1"
          intensity={0.8}
          rotationSpeed={0.25}
          interactive={false}
          glowAmount={0.012}
          pillarWidth={3.8}
          pillarHeight={0.6}
          noiseIntensity={0.25}
          mixBlendMode="screen"
          pillarRotation={0}
        />
        
        {/* Animated gradient overlays */}
        <div 
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(34,211,238,0.15), transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(59,130,246,0.12), transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(99,102,241,0.08), transparent 60%)
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

      {/* Back to home - Fixed at top left with beautiful effects */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-20 inline-flex items-center gap-2 px-5 py-3 bg-background/90 backdrop-blur-md border-2 border-cyan-500/40 rounded-xl text-sm font-bold text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/70 hover:bg-background/95 transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-2px] group shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] relative overflow-hidden"
      >
        {/* Animated gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-400/50 to-cyan-500/0 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10"></div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
        
        <ArrowLeft className="h-4 w-4 group-hover:translate-x-[-4px] transition-all duration-300 group-hover:text-cyan-300 relative z-10" />
        <span className="relative z-10">Back to home</span>
        
        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping-slow"></div>
      </Link>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-8">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Logo */}
          <div className="flex items-center justify-center mb-8 animate-in fade-in duration-700 delay-100 hover:scale-105 transition-transform">
            <Logo size={56} showText={true} textSize="lg" />
          </div>

          <Card className="shadow-2xl border-cyan-500/30 backdrop-blur-xl bg-background/95 hover:shadow-cyan-500/30 hover:border-cyan-500/50 transition-all duration-500 rounded-2xl overflow-hidden group">
            {/* Animated gradient top border */}
            <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
            
            <CardHeader className="space-y-3 text-center pb-8 pt-8">
              <div className="flex items-center justify-center mb-4">
                <GlitchText
                  speed={1}
                  enableShadows={true}
                  enableOnHover={true}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold"
                >
                  {title}
                </GlitchText>
              </div>
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
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to terms page or open modal
                    console.log('Terms of Service clicked');
                  }}
                  className="text-cyan-500 hover:text-cyan-400 hover:underline transition-colors font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded px-1"
                >
                  Terms of Service
                </button>
                {" "}and{" "}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to privacy page or open modal
                    console.log('Privacy Policy clicked');
                  }}
                  className="text-cyan-500 hover:text-cyan-400 hover:underline transition-colors font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded px-1"
                >
                  Privacy Policy
                </button>
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
  
  @keyframes ping-slow {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0;
    }
  }
  
  .animate-ping-slow {
    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }
`;
