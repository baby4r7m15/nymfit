import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUser } from '@/lib/UserContext';
import OnboardingQuestionnaire from '@/components/onboarding/OnboardingQuestionnaire';
import DailyRings from '@/components/dashboard/DailyRings';
import StreakCard from '@/components/dashboard/StreakCard';
import HRTTracker from '@/components/dashboard/HRTTracker';
import WaterTracker from '@/components/dashboard/WaterTracker';
import HabitChecklist from '@/components/tracker/HabitChecklist';
import { Edit2, Check, X } from 'lucide-react';

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const qc = useQueryClient();
  const { user, refresh } = useUser();
  const [editingGoals, setEditingGoals] = useState(false);
  const [goalForm, setGoalForm] = useState({ water_glasses: 8, habits_target: 4 });

  const { data: logs = [] } = useQuery({
    queryKey: ['dailylog', today],
    queryFn: () => base44.entities.DailyLog.filter({ date: today }),
    initialData: [],
  });

  const log = logs?.[0] || null;

  const upsert = useMutation({
    mutationFn: async (data) => {
      if (log?.id) return base44.entities.DailyLog.update(log.id, data);
      return base44.entities.DailyLog.create({ ...data, date: today });
    },
    onSuccess: (saved) => qc.setQueryData(['dailylog', today], [saved]),
  });

  const updateLog = (patch) => {
    const base = log || { date: today, food_entries: [], drink_entries: [], workouts_done: [], habits_done: [], water_glasses: 0, hrt_taken: [] };
    upsert.mutate({ ...base, ...patch });
  };

  const waterGoal = user?.daily_goals?.water_glasses || 8;
  const habitsGoal = user?.daily_goals?.habits_target || 4;
  const caloriesGoal = user?.daily_goals?.calories || 2000;
  const waterGlasses = log?.water_glasses || 0;
  const habitsDone = (log?.habits_done || []).length;
  const foodCals = (log?.food_entries || []).reduce((s, f) => s + (f.calories || 0), 0);
  const drinkCals = (log?.drink_entries || []).reduce((s, d) => s + (d.calories || 0), 0);
  const totalCals = foodCals + drinkCals;
  const hrtTaken = log?.hrt_taken || [];

  const saveMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe({ daily_goals: data }),
    onSuccess: () => { refresh(); setEditingGoals(false); },
  });

  const showOnboarding = user && !user.onboarding_done;
  const firstName = user?.display_name?.split(' ')[0] || 'lovely';

  React.useEffect(() => {
    setGoalForm({ water_glasses: waterGoal, habits_target: habitsGoal });
  }, [user]);

  const toggleHRT = (medId) => {
    const current = log?.hrt_taken || [];
    const next = current.includes(medId) ? current.filter(x => x !== medId) : [...current, medId];
    updateLog({ hrt_taken: next });
  };

  return (
    <div>
      {showOnboarding && <OnboardingQuestionnaire onComplete={() => {}} />}

      {/* Header */}
      <div className="mb-6">
        <div className="flex h-1 rounded-full overflow-hidden gap-px mb-4">
          <div className="flex-1 bg-secondary" />
          <div className="flex-1 bg-primary" />
          <div className="flex-1 bg-white/50" />
          <div className="flex-1 bg-primary" />
          <div className="flex-1 bg-secondary" />
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {format(new Date(), 'EEEE, MMMM d')}
        </div>
        <h1 className="font-display text-3xl text-foreground">
          Hey, <span className="text-primary">{firstName}</span> 💗
        </h1>
      </div>

      {/* Daily rings summary */}
      <DailyRings
        water={waterGlasses} waterGoal={waterGoal}
        habits={habitsDone} habitsGoal={habitsGoal}
        calories={totalCals} caloriesGoal={caloriesGoal}
      />

      <div className="mt-4 space-y-4">
        {/* Streak */}
        <StreakCard />

        {/* HRT quick-tick */}
        <HRTTracker takenToday={hrtTaken} onToggle={toggleHRT} />

        {/* Water */}
        <WaterTracker glasses={waterGlasses} onChange={(v) => updateLog({ water_glasses: v })} />

        {/* Habits */}
        <div className="bg-card border border-border rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-foreground">Habits ✨</h3>
            <span className="text-xs text-muted-foreground">{habitsDone}/{habitsGoal} done</span>
          </div>
          <HabitChecklist
            checked={log?.habits_done || []}
            onChange={(habits_done) => updateLog({ habits_done })}
          />
        </div>

        {/* Goal settings */}
        <div className="bg-card border border-border rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-foreground">Daily Goals 🎯</h3>
            {!editingGoals && (
              <button onClick={() => setEditingGoals(true)} className="text-xs text-muted-foreground hover:text-foreground">
                edit
              </button>
            )}
          </div>

          {editingGoals ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Water glasses</label>
                <input type="number" min="1" max="20" value={goalForm.water_glasses}
                  onChange={e => setGoalForm(f => ({ ...f, water_glasses: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-background rounded-xl px-4 py-3 text-sm text-foreground border border-border focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Habit target per day</label>
                <input type="number" min="1" max="20" value={goalForm.habits_target}
                  onChange={e => setGoalForm(f => ({ ...f, habits_target: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-background rounded-xl px-4 py-3 text-sm text-foreground border border-border focus:outline-none focus:border-primary" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => saveMutation.mutate(goalForm)} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors">
                  <Check className="w-4 h-4" /> save
                </button>
                <button onClick={() => setEditingGoals(false)} className="flex-1 flex items-center justify-center gap-2 bg-muted px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-border transition-colors">
                  <X className="w-4 h-4" /> cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>💧 Water: {waterGoal} glasses/day</div>
              <div>✨ Habits: {habitsGoal} per day</div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}