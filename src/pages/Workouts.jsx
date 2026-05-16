import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Plus, Dumbbell, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkoutForm from '@/components/workouts/WorkoutForm';
import WorkoutCard from '@/components/workouts/WorkoutCard';
import EmptyState from '@/components/shared/EmptyState';
import FemmeWorkouts from '@/components/femme/FemmeWorkouts';
import { useUser } from '@/lib/UserContext';
import { cn } from '@/lib/utils';

const FILTERS = ['all', 'glutes', 'legs', 'core', 'cardio', 'full_body', 'upper_body', 'flexibility'];
const ADMIN_EMAIL = 'nymfit.admin@gmail.com'; // change to your email

export default function Workouts() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState('progress');
  const qc = useQueryClient();
  const { user } = useUser();

  const isAdmin = user?.role === 'admin';

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list('-created_date', 200),
    initialData: [],
  });

  const create = useMutation({
    mutationFn: (d) => base44.entities.Workout.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workouts'] }); close(); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Workout.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workouts'] }); close(); },
  });
  const remove = useMutation({
    mutationFn: (id) => base44.entities.Workout.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts'] }),
  });

  const close = () => { setShowForm(false); setEditing(null); };
  const submit = (d) => editing ? update.mutate({ id: editing.id, data: d }) : create.mutate(d);
  const filtered = filter === 'all' ? workouts : workouts.filter(w => w.focus === filter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Sculpt</div>
          <h1 className="font-display text-3xl text-foreground">Workouts 💪</h1>
        </div>
        {isAdmin && tab === 'library' && (
          <Button onClick={() => { setEditing(null); setShowForm(!showForm); }}
            className="rounded-full px-5 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Add workout
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/40 rounded-2xl p-1.5 mb-6">
        {[
          { id: 'progress', label: '📊', full: 'Progress' },
          { id: 'library', label: '📚', full: 'Workout Library' },
        ].map(t => (
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

      <AnimatePresence mode="wait">
        {tab === 'library' && (
          <div key="library">
            <AnimatePresence>
              {showForm && isAdmin && <WorkoutForm workout={editing} onSubmit={submit} onCancel={close} />}
            </AnimatePresence>

            <Tabs value={filter} onValueChange={setFilter} className="mb-6">
              <TabsList className="rounded-full bg-muted/70 p-1 flex-wrap h-auto gap-1">
                {FILTERS.map(t => (
                  <TabsTrigger key={t} value={t} className="rounded-full capitalize data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
                    {t.replace('_', ' ')}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {filtered.length === 0 ? (
              <EmptyState icon={Dumbbell} title="No workouts here yet"
                description={isAdmin ? 'Add the first workout to this category.' : 'Check back soon — workouts are being added!'}
                action={isAdmin ? <Button onClick={() => setShowForm(true)} className="rounded-full px-5 text-primary-foreground">Add workout</Button> : null}
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {filtered.map(w => (
                    <WorkoutCard
                      key={w.id}
                      workout={w}
                      onEdit={isAdmin ? (x) => { setEditing(x); setShowForm(true); } : null}
                      onDelete={isAdmin ? (x) => remove.mutate(x.id) : null}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {tab === 'progress' && (
          <div key="progress">
            <FemmeWorkouts />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}