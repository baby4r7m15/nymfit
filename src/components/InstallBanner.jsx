import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed this session
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (sessionStorage.getItem('install-dismissed')) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
    setIsIOS(ios);

    if (ios) {
      // Show iOS instructions after a short delay
      setTimeout(() => setShowBanner(true), 2000);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    sessionStorage.setItem('install-dismissed', '1');
  };

  if (isDismissed || (!deferredPrompt && !isIOS)) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-border p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-2xl shrink-0">
              🌸
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground">Add NymFit to Home Screen</div>
              {isIOS ? (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tap <span className="font-medium">Share</span> then <span className="font-medium">"Add to Home Screen"</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Install for the full app experience ✨
                </p>
              )}
            </div>
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="shrink-0 bg-primary text-white text-xs px-3 py-1.5 rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Install
              </button>
            )}
            <button onClick={handleDismiss} className="shrink-0 p-1 rounded-full hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}