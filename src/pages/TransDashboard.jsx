import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/lib/UserContext';
import HRTSection from '@/components/trans/HRTSection';
import VoiceSection from '@/components/trans/VoiceSection';

export default function TransDashboard() {
  const { user } = useUser();

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <div className="flex h-1.5 rounded-full overflow-hidden gap-px mb-5">
          <div className="flex-1 bg-secondary" />
          <div className="flex-1 bg-primary" />
          <div className="flex-1 bg-white/60" />
          <div className="flex-1 bg-primary" />
          <div className="flex-1 bg-secondary" />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🏳️‍⚧️</span>
          <div>
            <h1 className="font-display text-3xl text-foreground">Trans Journey</h1>
            <p className="text-xs text-muted-foreground">HRT & voice training tracking 💗</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <HRTSection />
        <VoiceSection />
      </div>
    </div>
  );
}