import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, FileText, Bug, BarChart3, Zap, Shield, Brain, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Orb from "../components/custom/Orb";
import RotatingText from '../components/ui/rotation-text';
import MagicBento from '../components/ui/Magic-Bento';
import Logo from "@/components/Logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Test Generation",
      description: "Automatically generate comprehensive test cases from SRS documents and feature descriptions using advanced AI and NLP.",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: FileText,
      title: "SRS Document Analysis",
      description: "Upload and analyze Software Requirements Specifications (SRS) documents. Extract features intelligently with RAG technology.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Bug,
      title: "Smart Bug Analysis",
      description: "Classify and analyze bug reports with AI. Get severity detection, categorization, and intelligent fix suggestions.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Real-time Dashboard",
      description: "Track test results, bug trends, and project progress with interactive charts and comprehensive analytics.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Automated Workflows",
      description: "Streamline your QA process with automated test case generation, feature extraction, and project management.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Ensure high-quality software with comprehensive test coverage, bug tracking, and quality metrics.",
      color: "from-purple-500 to-violet-500",
    },
  ];

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      {/* Enhanced Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/98 backdrop-blur-xl border-b border-border shadow-lg shadow-cyan-500/5' 
          : 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm'
      }`}>
        <div className="container mx-auto px-4 h-16 md:h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size={40} showText={true} textSize="lg" />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              className="text-sm font-medium text-muted-foreground hover:text-cyan-400 transition-colors relative group"
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="#how-it-works" 
              className="text-sm font-medium text-muted-foreground hover:text-cyan-400 transition-colors relative group"
            >
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button 
                variant="ghost" 
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                Login
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 hover:scale-105">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="container mx-auto px-4 py-4 space-y-3 border-t border-border/50 bg-background/98 backdrop-blur-xl">
            <a 
              href="#features" 
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <div className="pt-2 space-y-2 border-t border-border/50">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Login
                </Button>
              </Link>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative z-10 text-center overflow-hidden">
        <div
          style={{
            width: "100%",
            height: "600px",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: -1,
            background:
              "radial-gradient(circle at 40% 50%, rgba(34,211,238,0.12), transparent 70%), radial-gradient(circle at 60% 30%, rgba(96,165,250,0.08), transparent 60%), radial-gradient(circle at 50% 70%, rgba(99,102,241,0.06), transparent 50%)",
          }}
        >
          <Orb hoverIntensity={0.3} rotateOnHover={true} hue={0} />
        </div>

        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 antialiased animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col items-center gap-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 via-indigo-500 to-purple-600 text-transparent bg-clip-text animate-in fade-in duration-1000 delay-200">
                Smart
              </span>
              
              <RotatingText
                texts={['QA Testing', 'Test Automation', 'Quality Assurance']}
                mainClassName="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-cyan-500/30 border border-cyan-400/30 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 text-3xl md:text-4xl"
                staggerFrom={"first"}
                initial={{ y: "100%", opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: "-100%", opacity: 0, scale: 1.2 }}
                staggerDuration={0.03}
                splitLevelClassName="overflow-hidden"
                elementLevelClassName="font-bold text-white drop-shadow-lg"
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
          
          <p className="text-lg md:text-xl text-foreground/70 leading-relaxed mb-12 max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 font-medium">
            Transform your QA process with AI-powered automation. Generate test cases from SRS documents, analyze bugs intelligently, and manage quality assurance effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base sm:text-lg px-6 sm:px-8 border-2 border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all duration-300 w-full sm:w-auto hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              Watch Demo
            </Button>
            <Link to="/login" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-500 text-white text-base sm:text-lg px-6 sm:px-8 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 px-4 bg-gradient-to-b from-muted/30 via-background to-muted/20 relative z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Everything You Need for Modern QA
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl md:max-w-2xl mx-auto leading-relaxed">
              Powerful AI-driven tools to streamline your testing workflow and improve quality
            </p>
          </div>

          {/* Features Grid - Improved Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-primary/50 overflow-hidden bg-card/80 hover:bg-card backdrop-blur-sm relative animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/0 transition-all duration-500 pointer-events-none" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-500/5 transition-opacity duration-500" />
                  <CardHeader className="relative z-10 pb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:shadow-cyan-500/20`}>
                      <Icon className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <CardTitle className="text-lg font-semibold mb-2 leading-tight group-hover:text-cyan-400 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground line-clamp-3 group-hover:text-foreground/80 transition-colors duration-300">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Magic Bento Section - Benefits with Animation */}
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <div className="text-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Why QBrain?
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Key benefits for your QA team
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
              spotlightRadius={400}
              particleCount={15}
              glowColor="0, 229, 255"
              disableAnimations={false}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 relative z-10 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to transform your QA process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '100ms' }}>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-cyan-400 transition-colors duration-300">Upload SRS</h3>
              <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                Upload your SRS document for AI analysis
              </p>
            </div>
            <div className="text-center group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors duration-300">Extract Features</h3>
              <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                AI automatically extracts features and requirements
              </p>
            </div>
            <div className="text-center group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '300ms' }}>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-400 transition-colors duration-300">Generate Tests</h3>
              <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                Get comprehensive test cases automatically
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 px-4 relative z-10 bg-gradient-to-b from-background to-muted/10">
        <div className="container mx-auto max-w-3xl">
          <Card className="border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-indigo-500/10 p-8 backdrop-blur-sm shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <CardContent className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Ready to Transform Your QA Process?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Start automating your testing workflow today
              </p>
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-500 text-white px-8 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
                >
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/10 relative z-10">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <Logo size={32} showText={true} textSize="sm" />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                AI-powered QA testing platform
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
              <Link to="/login" className="hover:text-cyan-400 transition-colors">Get Started</Link>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/50 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} QBrain. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-cyan-400 transition-colors" aria-label="GitHub">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-cyan-400 transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;