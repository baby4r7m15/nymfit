import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, TrendingUp, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MeasurementForm from '@/components/progress/MeasurementForm';
import MeasurementList from '@/components/progress/MeasurementList';
import BodyStatsChart from '@/components/progress/BodyStatsChart';
import StatSummaryCards from '@/components/progress/StatSummaryCards';
import PhotoJournal from '@/components/progress/PhotoJournal';
import PullToRefresh from '@/components/mobile/PullToRefresh';

const TABS = [
  { id: 'charts', label: '📈 Charts', icon: TrendingUp },
  { id: 'photos', label: '📸 Photos', icon: Camera },
];

export default function BodyProgress() {
  const [activeTab, setActiveTab] = useState('charts');
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: measurements = [] } = useQuery({
    queryKey: ['measurements'],
    queryFn: () => base44.entities.BodyMeasurement.list('-date', 200),
    initialData: [],
  });

  const create = useMutation({
    mutationFn: (d) => base44.entities.BodyMeasurement.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['measurements'] }); setShowForm(false); },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.BodyMeasurement.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['measurements'] }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-primary/70 mb-1">Transformation</p>
          <h1 className="font-display text-3xl text-foreground">Body Progress</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your silhouette, celebrate every centimetre 🌸</p>
        </div>
        {activeTab === 'charts' && (
          <Button onClick={() => setShowForm(v => !v)} className="rounded-full px-5 bg-primary hover:bg-primary/90 shrink-0">
            <Plus className="w-4 h-4 mr-2" /> Log entry
          </Button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === t.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Charts tab */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <AnimatePresence>
            {showForm && (
              <MeasurementForm
                onSubmit={(d) => create.mutate(d)}
                onCancel={() => setShowForm(false)}
              />
            )}
          </AnimatePresence>

          <PullToRefresh onRefresh={() => qc.invalidateQueries({ queryKey: ['measurements'] })}>
          {measurements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-card border border-border rounded-3xl p-16 text-center"
            >
              <div className="text-5xl mb-4">📏</div>
              <h3 className="font-display text-xl mb-2">Your journey starts here</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Log your first measurements — weight, waist, hips — to begin tracking your transformation over time.
              </p>
              <Button onClick={() => setShowForm(true)} className="rounded-full px-6 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Add first entry
              </Button>
            </motion.div>
          ) : (
            <>
              <StatSummaryCards measurements={measurements} />
              <BodyStatsChart measurements={measurements} />
              <MeasurementList measurements={measurements} onDelete={(m) => remove.mutate(m.id)} />
            </>
          )}
          </PullToRefresh>
        </div>
      )}

      {/* Photos tab */}
      {activeTab === 'photos' && <PhotoJournal />}
    </div>
  );
}