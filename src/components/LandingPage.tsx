import { motion } from "framer-motion";
import {
  MessageSquare,
  HelpCircle,
  Settings,
  ShieldCheck,
  Zap,
  Share2,
} from "lucide-react";

import { signInWithGoogle } from "../lib/firebase";

export default function LandingPage() {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-12 h-14 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-on-surface">googlechat.io</span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8 items-center">
            <a className="text-primary border-b-2 border-primary font-bold text-sm" href="#">Home</a>
            <a className="text-on-surface-variant text-sm hover:text-primary transition-colors" href="#">Features</a>
            <a className="text-on-surface-variant text-sm hover:text-primary transition-colors" href="#">Security</a>
          </nav>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-primary" />
            <Settings className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-primary" />
          </div>
        </div>
      </header>

      <main className="relative pt-14">
        {/* Geometric Accents */}
        <div className="geometric-accent top-20 left-10 w-96 h-96 bg-primary rounded-full"></div>
        <div className="geometric-accent bottom-20 right-10 w-[500px] h-[500px] bg-secondary rounded-full"></div>
        <div className="geometric-accent top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-tertiary opacity-[0.05] rounded-full"></div>

        {/* Hero Section */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 md:px-12 hero-pattern text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl w-full space-y-8"
          >
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center">
                <MessageSquare className="w-16 h-16 text-primary fill-primary/10" />
              </div>
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-on-background tracking-tight font-bold">
              Connect in <span className="text-primary">real-time</span>, <br className="hidden md:block" />everywhere.
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Streamline your team's communication with the next generation of real-time messaging. Designed for speed, security, and effortless collaboration across all your devices.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8">
              <button 
                onClick={handleLogin}
                className="flex items-center gap-3 bg-white text-on-background border border-outline-variant px-8 py-4 rounded-full font-bold shadow-sm hover:shadow-md active:scale-95 transition-all"
              >
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/yUzS6y_08xW_S7mXv2Vd_F4U8p9fG_0pG_1_Q8_1_Q8_1_Q8_1_Q8_1_Q8_1_Q8_1_Q8_1_Q8_1_Q8" />
                <span>Login with Google</span>
              </button>
              <button className="text-primary font-bold px-8 py-4 rounded-full hover:bg-primary-fixed/20 transition-all">
                Explore Features
              </button>
            </div>
          </motion.div>
        </section>

        {/* Bento Grid */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 glass-card rounded-3xl p-8 flex flex-col justify-between min-h-[400px] shadow-sm hover:shadow-lg transition-shadow">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold mb-6">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enterprise Ready</span>
                </div>
                <h3 className="font-display text-2xl text-on-surface mb-4 font-bold">Unmatched Security for Teams</h3>
                <p className="text-on-surface-variant max-w-md">End-to-end encryption ensures your conversations stay private. Compliance ready for any organization size.</p>
              </div>
              <div className="mt-8 rounded-2xl overflow-hidden border border-outline-variant h-48 bg-surface-container">
                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80" alt="Security" />
              </div>
            </div>
            
            <div className="md:col-span-4 bg-primary-container text-on-primary-container rounded-3xl p-8 flex flex-col shadow-lg hover:translate-y-[-4px] transition-transform">
              <Zap className="w-12 h-12 mb-6" />
              <h3 className="font-display text-2xl font-bold mb-4">Instant Sync</h3>
              <p className="opacity-90">Switch from your desktop to your mobile device without missing a single character. Real-time means real-time.</p>
              <div className="mt-auto pt-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-primary-container bg-surface-container-high" />
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary-fixed flex items-center justify-center text-on-primary-fixed text-[10px] font-bold">+12k</div>
                </div>
                <p className="text-xs mt-3 opacity-80">Joined by developers worldwide</p>
              </div>
            </div>

            <div className="md:col-span-5 glass-card rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <Share2 className="text-tertiary w-8 h-8" />
                <span className="text-xs text-outline-variant uppercase font-bold tracking-widest">Integration</span>
              </div>
              <h3 className="font-display text-2xl text-on-surface mb-4 font-bold">Seamless Ecosystem</h3>
              <p className="text-on-surface-variant">Connect with your favorite tools in one click. Google Workspace, GitHub, and Slack-ready integrations available out of the box.</p>
            </div>

            <div className="md:col-span-7 glass-card rounded-3xl p-2 flex flex-col md:flex-row shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6 md:w-1/2 flex flex-col justify-center">
                <h3 className="font-display text-2xl text-on-surface mb-3 font-bold">Custom Spaces</h3>
                <p className="text-on-surface-variant">Organize your projects, teams, and hobbies into dedicated spaces designed for productivity.</p>
              </div>
              <div className="md:w-1/2 h-48 md:h-full bg-surface-container-highest rounded-2xl">
                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80" alt="Spaces" />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-surface-container-lowest py-16 px-6 md:px-12 border-t border-outline-variant/30 mt-24">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-4">
              <span className="font-display text-2xl font-bold text-primary">googlechat.io</span>
              <p className="text-on-surface-variant max-w-xs text-sm">Empowering global communication through minimalist design and powerful technology.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="font-bold text-on-surface">Product</h4>
                <ul className="space-y-2 text-on-surface-variant text-sm">
                  <li><a className="hover:text-primary transition-colors" href="#">Features</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Integrations</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Enterprise</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-on-surface">Support</h4>
                <ul className="space-y-2 text-on-surface-variant text-sm">
                  <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">API Docs</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Status</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-on-surface">Company</h4>
                <ul className="space-y-2 text-on-surface-variant text-sm">
                  <li><a className="hover:text-primary transition-colors" href="#">Privacy</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Terms</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Security</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-outline">© 2024 googlechat.io. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
