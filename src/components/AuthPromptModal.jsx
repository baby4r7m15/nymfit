import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';

export default function AuthPromptModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-border p-8 max-w-sm w-full text-center"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="text-4xl mb-3">🌸</div>
            <h2 className="font-display text-2xl text-primary mb-2">join NymFit</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              sign in or create a free account to start your glow-up journey and connect with the community ♡
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="w-full bg-primary text-white py-3 rounded-full font-medium text-sm hover:bg-primary/90 transition-colors shadow-md"
              >
                sign in ♡
              </button>
              <button
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="w-full bg-accent text-accent-foreground py-3 rounded-full font-medium text-sm hover:bg-accent/70 transition-colors"
              >
                create a free account ✨
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}