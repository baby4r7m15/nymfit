import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Plus, LineChart as LineIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import MeasurementForm from '@/components/progress/MeasurementForm';
import ProgressChart from '@/components/progress/ProgressChart';
import MeasurementList from '@/components/progress/MeasurementList';

export default function Progress() {
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
    <>
      <PageHeader
        eyebrow="Transformation"
        title="Progress"
        description="A longitudinal view of the body you are gently sculpting. Log weekly for best insight."
        action={
          <Button onClick={() => setShowForm(!showForm)} className="rounded-full px-5 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New entry
          </Button>
        }
      />

      <AnimatePresence>
        {showForm && <MeasurementForm onSubmit={(d) => create.mutate(d)} onCancel={() => setShowForm(false)} />}
      </AnimatePresence>

      {measurements.length === 0 ? (
        <EmptyState
          icon={LineIcon}
          title="Your journey starts here"
          description="Log your first measurements — weight, waist, hips — to begin tracking your silhouette over time."
          action={
            <Button onClick={() => setShowForm(true)} className="rounded-full px-5">
              <Plus className="w-4 h-4 mr-2" /> Add first entry
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <ProgressChart measurements={measurements} />
          <MeasurementList measurements={measurements} onDelete={(m) => remove.mutate(m.id)} />
        </div>
      )}
    </>
  );
}