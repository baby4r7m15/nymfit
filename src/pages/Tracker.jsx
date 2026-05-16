import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Utensils, Dumbbell, Sparkles, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';
import ItemPicker from '@/components/tracker/ItemPicker';
import DayExtras from '@/components/tracker/DayExtras';
import QuickAddWorkout from '@/components/tracker/QuickAddWorkout';
import HabitChecklist from '@/components/tracker/HabitChecklist';

const TABS = [
  { id: 'habits', label: 'Habits', icon: Sparkles },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'extras', label: 'Extras', icon: Sun },
];

export default function Tracker() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const qc = useQueryClient();
  const [localLog, setLocalLog] = useState(null);
  const [activeTab, setActiveTab] = useState('habits');

  const { data: logs = [] } = useQuery({
    queryKey: ['dailylog', today],
    queryFn: () => base44.entities.DailyLog.filter({ date: today }),
  });
  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list('-created_date', 200),
    initialData: [],
  });

  const existing = logs[0];

  useEffect(() => {
    if (logs === undefined) return; // still loading
    setLocalLog(existing || { date: today, food_entries: [], drink_entries: [], workouts_done: [], habits_done: [], custom_habits: [], water_glasses: 0 });
  }, [existing?.id, today]);

  const upsert = useMutation({
    mutationFn: async (data) => {
      if (existing?.id) return base44.entities.DailyLog.update(existing.id, data);
      return base44.entities.DailyLog.create({ ...data, date: today });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dailylog', today] });
      qc.invalidateQueries({ queryKey: ['logs'] });
    },
  });

  const createWorkout = useMutation({
    mutationFn: (d) => base44.entities.Workout.create(d),
    onSuccess: (newWorkout) => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      const next = { ...localLog, workouts_done: [...(localLog?.workouts_done || []), newWorkout.id] };
      setLocalLog(next);
      debouncedSave(next);
    },
  });

  const debouncedSave = useMemo(() => debounce((d) => upsert.mutate(d), 500), [existing?.id]);

  const updateLog = (patch) => {
    const next = { ...localLog, ...patch };
    setLocalLog(next);
    debouncedSave(next);
  };

  const toggle = (key, id) => {
    const current = localLog?.[key] || [];
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    updateLog({ [key]: next });
  };

  if (!localLog) return null;

  return (
    <div>
      <div className="mb-6">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{format(new Date(), 'EEEE, MMM d')}</div>
        <h1 className="font-display text-3xl text-foreground">Today ✨</h1>
      </div>

      <div className="flex gap-1 bg-muted/40 rounded-2xl p-1.5 mb-6">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn('flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                activeTab === t.id ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground')}>
              <Icon className="w-4 h-4 shrink-0" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="max-w-2xl mx-auto">
        {activeTab === 'habits' && (
          <HabitChecklist
            checked={localLog.habits_done || []}
            onChange={(habits_done) => updateLog({ habits_done })}
          />
        )}

        {activeTab === 'workouts' && (
          <div className="space-y-4">
            {/* Workout checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Your Workouts</div>
                <span className="text-xs text-muted-foreground">{(localLog.workouts_done || []).length} done today</span>
              </div>
              {workouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm bg-card rounded-2xl border border-border">
                  <div className="text-3xl mb-2">🏋️</div>
                  <p>No workouts yet. Add one below!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {workouts.map((w) => {
                    const done = (localLog.workouts_done || []).includes(w.id);
                    return (
                      <div
                        key={w.id}
                        onClick={() => toggle('workouts_done', w.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                          done ? 'bg-primary/10 border-primary/25' : 'bg-card border-border hover:border-primary/30'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          done ? 'bg-primary border-primary' : 'border-border'
                        }`}>
                          {done && <span className="text-primary-foreground text-xs">✓</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{w.name}</div>
                          <div className="text-xs text-muted-foreground">{(w.focus || '').replace('_', ' ')} · {w.duration_min || 0} min · {w.difficulty}</div>
                        </div>
                        <span className="text-xl">{w.focus === 'cardio' ? '🏃' : w.focus === 'glutes' ? '🍑' : w.focus === 'core' ? '💫' : w.focus === 'upper_body' ? '💪' : w.focus === 'flexibility' ? '🧘' : '🏋️'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <QuickAddWorkout
              isPending={createWorkout.isPending}
              onCreate={(d, onDone) => createWorkout.mutate(d, { onSuccess: onDone })}
            />
          </div>
        )}

        {activeTab === 'extras' && (
          <DayExtras log={localLog} onChange={updateLog} />
        )}
      </div>
    </div>
  );
}