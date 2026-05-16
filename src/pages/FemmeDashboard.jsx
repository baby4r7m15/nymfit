import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUser } from '@/lib/UserContext';
import FemmeToday from '@/components/femme/FemmeToday';
import FemmeProgress from '@/components/femme/FemmeProgress';
import FemmeBeauty from '@/components/femme/FemmeBeauty';

const TABS = [
  { id: 'today', label: '🌸', full: 'Today & Body' },
  { id: 'beauty', label: '💄', full: 'Beauty' },
];

export default function FemmeDashboard() {
  const { user } = useUser();
  const [tab, setTab] = useState('today');

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">🌸</span>
          <div>
            <h1 className="font-display text-3xl text-foreground">Femme Dashboard</h1>
            <p className="text-xs text-muted-foreground">Your feminisation & beauty journey 💅✨</p>
          </div>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-primary via-secondary to-primary/30 rounded-full mt-4" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/40 rounded-2xl p-1.5 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center gap-1.5',
              tab === t.id ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
            )}>
            <span>{t.label}</span>
            <span className="hidden sm:inline">{t.full}</span>
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <div className="space-y-6">
          <FemmeToday />
          <FemmeProgress />
        </div>
      )}
      {tab === 'beauty' && <FemmeBeauty />}
    </div>
  );
}