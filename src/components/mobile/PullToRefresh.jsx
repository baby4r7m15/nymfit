import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pulling = useRef(false);

  const onTouchStart = useCallback((e) => {
    const el = e.currentTarget;
    if (el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!pulling.current || startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) { setPullDist(0); return; }
    // Apply rubber-band resistance
    const dist = Math.min(dy * 0.45, THRESHOLD + 24);
    setPullDist(dist);
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDist >= THRESHOLD) {
      setRefreshing(true);
      setPullDist(0);
      await onRefresh();
      setRefreshing(false);
    } else {
      setPullDist(0);
    }
    startY.current = null;
  }, [pullDist, onRefresh]);

  const progress = Math.min(pullDist / THRESHOLD, 1);

  return (
    <div
      className="relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Indicator */}
      <AnimatePresence>
        {(pullDist > 4 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none"
            style={{ transform: `translateY(${refreshing ? 8 : pullDist - 40}px)` }}
          >
            <div className="w-9 h-9 rounded-full bg-card border border-border shadow-lg flex items-center justify-center">
              {refreshing ? (
                <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <motion.span
                  className="text-primary text-base"
                  style={{ rotate: progress * 180 }}
                >
                  ↓
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content shift */}
      <div style={{ transform: `translateY(${refreshing ? 48 : pullDist}px)`, transition: refreshing || pullDist === 0 ? 'transform 0.25s ease' : 'none' }}>
        {children}
      </div>
    </div>
  );
}