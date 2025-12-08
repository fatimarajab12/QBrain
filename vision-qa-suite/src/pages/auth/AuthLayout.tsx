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
    <div
      className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden"
      style={{ fontFamily: "var(--font-arabic)" }}
    >
      {/* Enhanced Background with gradients */}
      <div className="absolute inset-0 z-0">
        {/* Gradient overlays */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(34,211,238,0.15), transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(59,130,246,0.12), transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(99,102,241,0.08), transparent 60%)
            `
          }}
        />
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
          <div className="flex items-center justify-center mb-8 animate-in fade-in duration-700 delay-100">
            <Logo size={48} showText={true} textSize="lg" />
          </div>

          <Card className="shadow-2xl border-cyan-500/20 backdrop-blur-xl bg-background/90 hover:shadow-cyan-500/10 transition-all duration-300">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle
                className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {title}
              </CardTitle>
              <CardDescription
                className="text-base text-foreground/90"
                style={{ fontFamily: "var(--font-arabic)" }}
              >
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {children}
              
              {/* Terms and Privacy */}
              <div className="mt-6 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;