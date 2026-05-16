import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/lib/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Check, X, LogOut, MessageCircle, ChevronRight, Crown, Target, Trash2, AlertTriangle } from 'lucide-react';
import BadgeDisplay from '@/components/shared/BadgeDisplay';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import BadgesSection from '@/components/profile/BadgesSection';
import SupportModal from '@/components/support/SupportModal';
import OnboardingQuestionnaire from '@/components/onboarding/OnboardingQuestionnaire';
import ThemeSelector from '@/components/profile/ThemeSelector';

const AVATARS = ['🌸', '🎀', '🌷', '💗', '✨', '🍑', '🌺', '🦋', '🫧', '🩷', '🌙', '💫'];

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: '', bio: '', avatar_emoji: '🌸', goal: '' });
  const [showSupport, setShowSupport] = useState(false);
  const [showEditGoals, setShowEditGoals] = useState(false);

  const { user, refresh } = useUser();
  const qc = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['my-posts'],
    queryFn: () => base44.entities.CommunityPost.filter({ author_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['all-logs'],
    queryFn: () => base44.entities.DailyLog.list('-date', 60),
    initialData: [],
  });

  const { data: myTickets = [] } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 5),
    initialData: [],
    enabled: !!user,
  });

  const activeTicket = myTickets.find(t => t.status !== 'closed');

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || user.full_name || '',
        bio: user.bio || '',
        avatar_emoji: user.avatar_emoji || '🌸',
        goal: user.goal || '',
      });
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => { refresh(); setEditing(false); },
  });

  const streak = (() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (logs.find(l => l.date === key)) count++;
      else if (i > 0) break;
    }
    return count;
  })();

  const CATEGORY_LABELS = {
    general_inquiry: 'General Inquiry',
    technical_issue: 'Technical Issue',
    billing_question: 'Billing Question',
    feedback: 'Feedback',
  };

  const STATUS_STYLES = {
    open: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    closed: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <SupportModal open={showSupport} onClose={() => setShowSupport(false)} />
        {showEditGoals && (
          <OnboardingQuestionnaire onComplete={() => setShowEditGoals(false)} />
        )}

        {/* Support — premium gated */}
        <button
          onClick={() => setShowSupport(true)}
          className={`w-full flex items-center gap-3 rounded-3xl p-4 transition-colors text-left border ${
            user?.is_premium
              ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
              : 'bg-card border-border hover:border-border'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Premium Support</span>
              {user?.is_premium
                ? activeTicket && <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[activeTicket.status]}`}>{activeTicket.status}</span>
                : <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Crown className="w-2.5 h-2.5" />Premium</span>
              }
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {user?.is_premium
                ? activeTicket ? `Active: ${CATEGORY_LABELS[activeTicket.category] || 'Support'}` : 'Get help from our team 💗'
                : 'Upgrade to access direct support'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {editing ? (
                <div className="flex flex-wrap gap-2 max-w-[200px]">
                  {AVATARS.map(e => (
                    <button key={e} onClick={() => setForm(f => ({ ...f, avatar_emoji: e }))}
                      className={`text-2xl p-1.5 rounded-xl transition-all ${form.avatar_emoji === e ? 'bg-accent ring-2 ring-primary' : 'hover:bg-muted'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-4xl border-4 border-border shadow-md">
                  {form.avatar_emoji}
                </div>
              )}
              {!editing && (
                <div>
                  <h2 className="font-display text-2xl text-foreground mb-1.5">{form.display_name || user?.full_name || 'my profile'}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <BadgeDisplay user={user} size="sm" />
                  </div>
                  {form.bio && <p className="text-sm mt-2 max-w-xs">{form.bio}</p>}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={() => saveMutation.mutate(form)} className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditing(false)} className="p-2 rounded-full bg-muted hover:bg-border transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="p-2 rounded-full bg-muted hover:bg-border transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {editing && (
            <div className="space-y-3">
              <Input placeholder="Display name" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
              <Textarea placeholder="A little about you 🌸" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2} />
              <Input placeholder="Your glow-up goal (e.g. feel strong & soft ✨)" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} />
            </div>
          )}

          {!editing && form.goal && (
            <div className="mt-4 bg-accent rounded-2xl px-4 py-3 text-sm text-accent-foreground">
              🎯 Goal: {form.goal}
            </div>
          )}
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { emoji: '🔥', label: 'day streak', value: streak },
            { emoji: '📸', label: 'posts shared', value: posts.length },
            { emoji: '📅', label: 'days logged', value: logs.length },
          ].map(({ emoji, label, value }) => (
            <div key={label} className="bg-card rounded-3xl border border-border p-5 text-center">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="font-display text-3xl text-primary">{value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* My posts */}
        <div className="bg-card rounded-3xl border border-border p-6">
          <h3 className="font-display text-xl mb-4">my stories 📸</h3>
          {posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <div className="text-4xl mb-3">🌱</div>
              No posts yet — share your first glow-up story in the community!
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {posts.map(p => (
                <div key={p.id} className="rounded-2xl border border-border overflow-hidden bg-muted/30">
                  {p.photo_url && <img src={p.photo_url} alt="" className="w-full h-32 object-cover" />}
                  <div className="p-3">
                    <p className="text-xs line-clamp-2 text-foreground">{p.caption}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {(p.tags || []).map(t => (
                        <span key={t} className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit goals */}
        <button
          onClick={() => setShowEditGoals(true)}
          className="w-full flex items-center gap-3 rounded-3xl p-4 bg-card border border-border hover:border-primary/30 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">Edit Goals & Body Info</div>
            <div className="text-xs text-muted-foreground mt-0.5">Update your wellness goals, weight, and daily targets</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>

        <ThemeSelector />

        <BadgesSection />

        {/* Discord */}
        <a href="https://discord.gg/EW3Hb6PBjy" target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center gap-3 rounded-3xl p-4 bg-[#5865F2]/10 border border-[#5865F2]/30 hover:border-[#5865F2]/60 transition-colors text-left">
          <div className="w-9 h-9 rounded-full bg-[#5865F2]/20 flex items-center justify-center shrink-0 text-lg">
            💬
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">Join our Discord</div>
            <div className="text-xs text-muted-foreground mt-0.5">Chat with the NymFit community 🏳️‍⚧️✨</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </a>

        <button onClick={() => base44.auth.logout()} className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground py-3 transition-colors select-none">
          <LogOut className="w-4 h-4" /> log out
        </button>

        {/* Delete Account */}
        <DeleteAccountSection />
    </div>
  );
}

function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm.toLowerCase() !== 'delete') return;
    setDeleting(true);
    try {
      await base44.auth.updateMe({ account_deleted: true, deleted_at: new Date().toISOString() });
      await base44.auth.logout();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 text-xs text-destructive/60 hover:text-destructive py-3 transition-colors select-none"
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete account
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base">Delete account</h3>
                  <p className="text-xs text-muted-foreground">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 space-y-1.5">
                <p className="text-sm font-medium text-destructive">What will be deleted:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Your profile, display name & avatar</li>
                  <li>All daily logs, measurements & photos</li>
                  <li>HRT & skincare history</li>
                  <li>Community posts & comments</li>
                  <li>All personal data permanently</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Type <span className="font-mono font-semibold text-destructive">delete</span> to confirm:</p>
                <input
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="delete"
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground border border-border focus:outline-none focus:border-destructive"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setOpen(false); setConfirm(''); }}
                  className="flex-1 py-3 rounded-2xl border border-border text-sm font-medium hover:bg-muted transition-colors select-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={confirm.toLowerCase() !== 'delete' || deleting}
                  className="flex-1 py-3 rounded-2xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-40 select-none"
                >
                  {deleting ? 'Deleting…' : 'Delete forever'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}