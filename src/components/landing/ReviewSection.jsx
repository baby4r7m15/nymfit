import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110">
          <Star className={`w-6 h-6 ${(hover || value) >= n ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ authUser, onAuthRequired }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ author_name: '', text: '', rating: 5 });
  const [submitted, setSubmitted] = useState(false);

  const { data: reviews = [] } = useQuery({
    queryKey: ['site-reviews'],
    queryFn: () => base44.entities.SiteReview.filter({ visible: true }, '-created_date', 20),
    initialData: [],
  });

  const submit = useMutation({
    mutationFn: (d) => base44.entities.SiteReview.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-reviews'] });
      setSubmitted(true);
      setShowForm(false);
      setForm({ author_name: '', text: '', rating: 5 });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.text.trim() || !form.rating) return;
    submit.mutate({
      ...form,
      author_email: authUser?.email || '',
      author_name: form.author_name || authUser?.display_name || authUser?.full_name || 'anonymous',
    });
  };

  const openForm = () => {
    if (!authUser) { onAuthRequired(); return; }
    setShowForm(true);
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-display text-3xl text-foreground">what the cuties say</h2>
            <p className="text-muted-foreground text-sm mt-1">real reviews from real glow-up girlies</p>
          </div>
          {!submitted ? (
            <button onClick={openForm}
              className="self-start sm:self-auto bg-accent/60 border border-primary/20 text-primary text-sm px-5 py-2.5 rounded-full hover:bg-accent transition-all font-medium">
              + leave a review ♡
            </button>
          ) : (
            <div className="text-sm text-primary px-4 py-2 bg-primary/10 rounded-full">✨ thanks for your review!</div>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form onSubmit={handleSubmit}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="card-glow rounded-3xl p-6 mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-foreground">your review</div>
                <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground text-xs">cancel</button>
              </div>
              <input
                value={form.author_name}
                onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                placeholder={authUser?.display_name || authUser?.full_name || 'your name (optional)'}
                className="w-full bg-background rounded-xl px-4 py-2.5 text-sm border border-border focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
              <textarea
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                placeholder="share your experience ✨"
                rows={3}
                required
                className="w-full bg-background rounded-xl px-4 py-2.5 text-sm border border-border focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground resize-none"
              />
              <div className="flex items-center justify-between">
                <StarPicker value={form.rating} onChange={(r) => setForm(f => ({ ...f, rating: r }))} />
                <button type="submit" disabled={submit.isPending}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {submit.isPending ? 'sending…' : 'submit ♡'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <div className="text-4xl mb-3">🌱</div>
            be the first to leave a review!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {reviews.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                className="card-glow rounded-3xl p-6 hover:border-primary/30 transition-colors">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`w-4 h-4 ${r.rating >= n ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4 text-foreground/80">"{r.text}"</p>
                <div className="text-xs text-primary font-medium">— {r.author_name || 'anonymous'}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}