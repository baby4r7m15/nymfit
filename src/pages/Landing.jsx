import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import ReviewSection from '@/components/landing/ReviewSection';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AuthPromptModal from '@/components/AuthPromptModal';
import { applyTheme } from '@/lib/useTheme';

const FEATURES = [
{ icon: '🍑', title: 'Soft body goals', desc: 'Track curves, hips & waist to celebrate your femme silhouette.' },
{ icon: '🌸', title: 'Feminisation journey', desc: 'Log HRT, skincare & femme habits tailored just for you.' },
{ icon: '📸', title: 'Safe community', desc: 'Share your glow-up with girls & femboys who truly get it.' },
{ icon: '✨', title: 'Every win counts', desc: 'Zero judgment — every soft step of your journey matters.' }];



export default function Landing() {
  const [authUser, setAuthUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {e.preventDefault();setDeferredPrompt(e);};
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      // Fallback: redirect to login (already installed or iOS)
      requireAuth();
    }
  };

  useEffect(() => {
    base44.auth.me().then((u) => {
      setAuthUser(u);
      // Apply user's saved theme to the landing page
      if (u?.theme) applyTheme(u.theme);
      // If user is logged in AND in PWA (standalone) mode, go straight to the app
      const isPwa = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      if (u && isPwa) navigate('/dashboard', { replace: true });
    }).catch(() => setAuthUser(null));
  }, []);

  const requireAuth = () => {
    if (!authUser) {setShowAuthModal(true);return;}
    navigate('/dashboard');
  };

  const { data: publicStats = {} } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => base44.functions.invoke('publicStats', {}).then(r => r.data),
    initialData: {},
  });

  const stats = [
    { emoji: '💗', value: publicStats.memberCount || 0, label: 'members' },
    { emoji: '✨', value: publicStats.habitsTracked || 0, label: 'habits tracked' },
    { emoji: '📸', value: publicStats.storiesCount || 0, label: 'stories shared' },
  ];


  return (
    <div className={`min-h-screen text-foreground overflow-x-hidden ${(!authUser || !authUser.theme || authUser.theme === 'trans_dark') ? 'bg-hero-gradient' : 'bg-background'}`}>
      <AuthPromptModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="font-display text-2xl text-primary">NymFit</span>
        <div className="flex gap-3 items-center">
          {authUser ?
          <button onClick={requireAuth} className="flex items-center gap-2 bg-card border border-border rounded-full pl-2 pr-4 py-1.5 shadow-sm hover:border-primary/50 transition-all">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-base">
                {authUser.avatar_emoji || '🌸'}
              </div>
              <span className="text-sm font-medium">{authUser.display_name || authUser.full_name || 'cutie'}</span>
            </button> :

          <>
              <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                log in
              </button>
              <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-md glow-pink font-medium">
                join free ♡
              </button>
            </>
          }
        </div>
      </nav>

      {/* HERO */}
      <section className="relative text-center px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-32 max-w-5xl mx-auto">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-20 right-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 border border-primary/20 text-primary text-xs px-4 py-1.5 rounded-full mb-8 font-medium backdrop-blur-sm bg-[hsl(var(--accent))]">
            
            <Sparkles className="w-3 h-3" /> Your femme body made easy
          </motion.div>

          <h1 className="font-display text-5xl sm:text-8xl leading-tight mb-6">
            <span className="text-gradient">soft</span>{' '}
            <span className="text-foreground/90">curves,</span>
            <br />
            <span className="text-foreground/90">softer </span>
            <span className="text-gradient">you</span>
            <span className="text-foreground/90">.</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">Track your feminization journey, shape your silhouette & celebrate every soft, beautiful win! 🏳️‍⚧️🍑✨

          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={handleInstall}
              className="group bg-primary text-primary-foreground text-base px-10 py-4 rounded-full font-semibold shadow-2xl glow-pink flex items-center gap-2 justify-center">
              
              start your glow-up ✨
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        {/* Floating preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative mt-16 sm:mt-24 flex justify-center">
          
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border shadow-2xl p-6 max-w-xs text-left glow-pink">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🍑</span>
              <div>
                <div className="text-sm font-semibold text-foreground">Hips +2cm this month!</div>
                <div className="text-xs text-muted-foreground">Waist/hip ratio improving 💗</div>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full w-[85%]" />
            </div>
            <div className="flex gap-1.5">
              {['🍑', '💊', '🧴', '🏃‍♀️', '💧', '🧘', '🌙', '✨'].map((e, i) =>
              <span key={i} className="text-sm">{e}</span>
              )}
            </div>
          </motion.div>

          







          
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            className="font-display text-3xl sm:text-4xl text-center mb-4 text-[hsl(var(--primary))]">
            
            built for your soft body goals
          </motion.h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {FEATURES.map((f, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card-glow rounded-3xl p-6 text-center hover:border-primary/40 transition-colors group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <div className="font-semibold text-sm mb-2 text-foreground">{f.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="card-glow rounded-3xl p-8 flex flex-row items-center justify-around gap-4 text-center">
            {stats.map(({ emoji, value, label }) =>
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}>
                <div className="text-3xl mb-2">{emoji}</div>
                <motion.div key={value} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="font-display text-3xl sm:text-4xl text-primary">
                  {value.toLocaleString()}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewSection authUser={authUser} onAuthRequired={() => setShowAuthModal(true)} />

      {/* CTA */}
      














      

      {/* Discord CTA */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          <a href="https://discord.gg/EW3Hb6PBjy" target="_blank" rel="noopener noreferrer"
            className="card-glow rounded-3xl p-6 flex items-center gap-5 hover:border-primary/40 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#5865F2]/20 flex items-center justify-center shrink-0 text-3xl group-hover:scale-110 transition-transform">
              💬
            </div>
            <div className="flex-1">
              <div className="font-display text-lg text-foreground">Join our Discord ♡</div>
              <div className="text-sm text-muted-foreground mt-0.5">Connect with trans girls, femboys & femme cuties in our community server 🏳️‍⚧️✨</div>
            </div>
            <div className="bg-[#5865F2] text-white text-sm font-medium px-5 py-2.5 rounded-full shrink-0 group-hover:bg-[#4752c4] transition-colors">
              Join
            </div>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-xs bg-background text-foreground">
        <span className="font-display mr-2 text-[hsl(var(--primary))]">NymFit</span>
        made with ♡ for trans girls, femboys & all femme cuties 🏳️‍⚧️ · 2026
      </footer>
    </div>);

}