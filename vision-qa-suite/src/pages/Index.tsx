import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Orb from "../components/custom/Orb";
import RotatingText from '../components/ui/rotation-text';
import MagicBento from '../components/ui/Magic-Bento';
import Logo from "@/components/Logo";

const Index = () => {
  return (
    <div className="min-h-screen relative bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size={40} showText={true} textSize="lg" />
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-cyan-500/10">
                Login
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative z-10 text-center">
        <div
          style={{
            width: "100%",
            height: "600px",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: -1,
            background:
              "radial-gradient(circle at 40% 50%, rgba(0,229,255,0.05), transparent 70%)",
          }}
        >
          <Orb hoverIntensity={0.5} rotateOnHover={true} hue={0} />
        </div>

        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 antialiased">
            <div className="flex flex-col items-center gap-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
                Smart
              </span>
              
              <RotatingText
                texts={['QA Testing', 'Test Automation', 'Quality Assurance']}
                mainClassName="bg-gradient-to-r from-cyan-400  text-white px-6 py-4 rounded-2xl shadow-2xl shadow-blue-500/25 border border-blue-400/20 backdrop-blur-sm"
                staggerFrom={"first"}
                initial={{ y: "100%", opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: "-100%", opacity: 0, scale: 1.2 }}
                staggerDuration={0.03}
                splitLevelClassName="overflow-hidden"
                elementLevelClassName="font-bold"
                transition={{ 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 300,
                  mass: 0.8
                }}
                rotationInterval={2500}
                splitBy="words"
              />
            </div>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto mt-8">
            Automate your QA process with AI — generate test cases, analyze bugs, and manage quality effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/10"
            >
              Watch Demo
            </Button>
            <Link to="/login">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-lg px-8 shadow-lg shadow-cyan-500/25"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid with MagicBento */}
      <section className="py-24 px-4 bg-muted/30 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need for Modern QA
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful AI-driven tools to streamline your testing workflow and improve quality
            </p>
          </div>

          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={350}
            particleCount={12}
            glowColor="0, 229, 255"
            disableAnimations={false}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 relative z-10 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <div className="mb-4">
            <div className="mx-auto mb-3 flex items-center justify-center">
              <Logo size={48} />
            </div>
          </div>
          <p className="text-muted-foreground">
            © 2024 QBrain. Powered by AI to make testing smarter.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;