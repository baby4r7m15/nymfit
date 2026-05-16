import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/lib/UserContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Trash2, Users, Image, Heart, Search, ChevronDown, ChevronUp, MessageCircle, Check, X, Edit2, Star, Eye, EyeOff, Crown, FlaskConical, Settings2, Headphones, ShieldCheck, Award } from 'lucide-react';
import { ALL_BADGES, ADMIN_BADGE, EARLY_MEMBER_BADGE, FIRST_100_BADGE } from '@/lib/badges';
import SupportTicketPanel from '@/components/admin/SupportTicketPanel';
import AdminBadge from '@/components/premium/AdminBadge';
import PageHeader from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import PremiumBadge from '@/components/premium/PremiumBadge';

function PostRow({ post, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['admin-comments', post.id],
    queryFn: () => base44.entities.PostComment.filter({ post_id: post.id }),
    enabled: expanded,
    initialData: [],
  });

  const deleteComment = useMutation({
    mutationFn: (id) => base44.entities.PostComment.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-comments', post.id] }),
  });

  return (
    <>
      <tr className="hover:bg-muted/20 transition-colors">
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">{post.avatar_emoji || '🌸'}</span>
            <span className="font-medium text-foreground">{post.author_name || 'anonymous'}</span>
          </div>
        </td>
        <td className="px-5 py-3.5 text-muted-foreground max-w-xs">
          <p className="truncate">{post.caption}</p>
        </td>
        <td className="px-5 py-3.5">
          <div className="flex flex-wrap gap-1">
            {(post.tags || []).slice(0, 3).map(t => (
              <span key={t} className="bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-full">#{t}</span>
            ))}
          </div>
        </td>
        <td className="px-5 py-3.5">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Heart className="w-3.5 h-3.5 text-primary" /> {post.likes || 0}
          </span>
        </td>
        <td className="px-5 py-3.5 text-muted-foreground text-xs">
          {post.created_date ? format(new Date(post.created_date), 'MMM d, yyyy') : '—'}
        </td>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors flex items-center gap-1 text-xs"
              title="View comments"
            >
              <MessageCircle className="w-4 h-4" />
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="px-5 pb-4 bg-muted/10">
            <div className="ml-8 border-l-2 border-border pl-4 space-y-2 pt-2">
              {comments.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2">No comments yet.</div>
              ) : comments.map(c => (
                <div key={c.id} className="flex items-start justify-between gap-3 bg-muted rounded-2xl px-4 py-2.5 border border-border">
                  <div className="flex items-start gap-2">
                    <span className="text-base">{c.avatar_emoji || '💬'}</span>
                    <div>
                      <span className="text-xs font-medium text-foreground">{c.author_name || 'anonymous'}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.text}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteComment.mutate(c.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const PREMIUM_FEATURES = [
  { id: 'advanced_analytics', emoji: '📊', label: 'Advanced Analytics' },
  { id: 'ai_coach', emoji: '🤖', label: 'AI Glow Coach' },
  { id: 'custom_themes', emoji: '🎨', label: 'Custom Themes' },
  { id: 'unlimited_habits', emoji: '✨', label: 'Unlimited Habits' },
  { id: 'progress_reports', emoji: '📄', label: 'Weekly Reports' },
  { id: 'priority_support', emoji: '💎', label: 'Priority Support' },
];

const SPECIAL_BADGES = [
  { ...ADMIN_BADGE, isSpecial: true, field: 'role', specialValue: 'admin' },
  { id: 'premium', emoji: '👑', label: 'Premium', desc: 'Premium member', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', isSpecial: true, field: 'is_premium' },
  { ...EARLY_MEMBER_BADGE, isSpecial: true },
  { ...FIRST_100_BADGE, isSpecial: true },
];

function BadgesModal({ u, onClose, onToggleBadge, onToggleSpecial }) {
  const earnedBadges = u.earned_badges || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-card border border-border rounded-3xl shadow-2xl p-6 w-full max-w-sm max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-semibold text-foreground">{u.display_name || u.full_name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Grant or revoke badges</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Special badges */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2 px-1">Special</div>
            <div className="space-y-1.5">
              {SPECIAL_BADGES.map(badge => {
                let isGranted;
                if (badge.id === 'admin') isGranted = u.role === 'admin';
                else if (badge.id === 'premium') isGranted = !!u.is_premium;
                else isGranted = earnedBadges.includes(badge.id);

                return (
                  <button key={badge.id} onClick={() => onToggleSpecial(badge)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all border ${
                      isGranted ? `${badge.color} hover:opacity-80` : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                    }`}>
                    <span className="text-xl">{badge.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-xs">{badge.label}</div>
                      <div className="text-[10px] opacity-70">{badge.desc}</div>
                    </div>
                    <div className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${isGranted ? 'bg-primary' : 'bg-border'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${isGranted ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity badges */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2 px-1">Activity Badges</div>
            <div className="space-y-1.5">
              {ALL_BADGES.filter(b => b.id !== 'early_member' && b.id !== 'first_100').map(badge => {
                const isGranted = earnedBadges.includes(badge.id);
                return (
                  <button key={badge.id} onClick={() => onToggleBadge(badge.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all border ${
                      isGranted ? `${badge.color} hover:opacity-80` : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                    }`}>
                    <span className="text-xl">{badge.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-xs">{badge.label}</div>
                      <div className="text-[10px] opacity-70">{badge.desc}</div>
                    </div>
                    <div className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${isGranted ? 'bg-primary' : 'bg-border'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${isGranted ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesModal({ u, onClose, onToggle }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-3xl shadow-2xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-semibold text-foreground">{u.display_name || u.full_name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Premium feature access</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {PREMIUM_FEATURES.map(f => {
            const on = !!(u.premium_features?.[f.id]);
            return (
              <button key={f.id} onClick={() => onToggle(f.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all ${
                  on ? 'bg-yellow-500/10 border border-yellow-500/25 text-yellow-300' : 'bg-muted/50 border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="text-xl">{f.emoji}</span>
                <span className="flex-1 text-left font-medium">{f.label}</span>
                <div className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${on ? 'bg-yellow-500' : 'bg-border'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${on ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UserRow({ u, onOpenFeatures, onOpenBadges }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(u.display_name || u.full_name || '');
  const qc = useQueryClient();

  const updateUser = useMutation({
    mutationFn: (data) => base44.entities.User.update(u.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); qc.invalidateQueries({ queryKey: ['me'] }); setEditing(false); },
  });

  const togglePremium = () => updateUser.mutate({ is_premium: !u.is_premium });

  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-base shrink-0">
            {u.avatar_emoji || '🌸'}
          </div>
          {editing ? (
            <div className="flex items-center gap-2">
              <Input value={name} onChange={e => setName(e.target.value)} className="h-7 text-sm w-36" autoFocus />
              <button onClick={() => updateUser.mutate({ display_name: name })} className="p-1 rounded-lg bg-primary text-white hover:bg-primary/90">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditing(false)} className="p-1 rounded-lg bg-muted hover:bg-border">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground">{u.display_name || u.full_name || '—'}</span>
              {u.is_premium && <PremiumBadge size="xs" />}
              <button onClick={() => setEditing(true)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          {u.role || 'user'}
        </span>
      </td>
      <td className="px-5 py-3.5 text-muted-foreground text-xs">
        {u.created_date ? format(new Date(u.created_date), 'MMM d, yyyy') : '—'}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePremium}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              u.is_premium
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/10'
                : 'bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-foreground'
            }`}
          >
            <Crown className="w-3 h-3" />
            {u.is_premium ? 'Remove' : 'Grant'}
          </button>
          <button
            onClick={() => onOpenFeatures(u)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground transition-all"
          >
            <Settings2 className="w-3 h-3" />
            Features
          </button>
          <button
            onClick={() => onOpenBadges(u)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground transition-all"
          >
            <Award className="w-3 h-3" />
            Badges
          </button>
        </div>
      </td>
    </tr>
  );
}

function UserCard({ u, onOpenFeatures, onOpenBadges }) {
  const qc = useQueryClient();
  const updateUser = useMutation({
    mutationFn: (data) => base44.entities.User.update(u.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); qc.invalidateQueries({ queryKey: ['me'] }); },
  });

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-lg shrink-0">
          {u.avatar_emoji || '🌸'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-foreground text-sm">{u.display_name || u.full_name || '—'}</span>
            {u.is_premium && <PremiumBadge size="xs" />}
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {u.role || 'user'}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => updateUser.mutate({ is_premium: !u.is_premium })}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all border ${
            u.is_premium ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          <Crown className="w-3 h-3" /> {u.is_premium ? 'Remove Premium' : 'Grant Premium'}
        </button>
        <button
          onClick={() => onOpenFeatures(u)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border bg-muted text-muted-foreground border-border"
        >
          <Settings2 className="w-3 h-3" /> Features
        </button>
        <button
          onClick={() => onOpenBadges(u)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border bg-muted text-muted-foreground border-border"
        >
          <Award className="w-3 h-3" /> Badges
        </button>
      </div>
    </div>
  );
}

function PostCard({ post, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['admin-comments', post.id],
    queryFn: () => base44.entities.PostComment.filter({ post_id: post.id }),
    enabled: expanded,
    initialData: [],
  });

  const deleteComment = useMutation({
    mutationFn: (id) => base44.entities.PostComment.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-comments', post.id] }),
  });

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-xl shrink-0">{post.avatar_emoji || '🌸'}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground text-sm">{post.author_name || 'anonymous'}</div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.caption}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {(post.tags || []).slice(0, 3).map(t => (
              <span key={t} className="bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-full">#{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Heart className="w-3.5 h-3.5 text-primary" /> {post.likes || 0}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(e => !e)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            <MessageCircle className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(post.id)} className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border pt-3 space-y-2">
          {comments.length === 0 ? <div className="text-xs text-muted-foreground">No comments.</div> : comments.map(c => (
            <div key={c.id} className="flex items-start justify-between gap-2 bg-muted rounded-xl px-3 py-2">
              <div className="flex gap-1.5">
                <span>{c.avatar_emoji || '💬'}</span>
                <div>
                  <div className="text-xs font-medium text-foreground">{c.author_name}</div>
                  <div className="text-xs text-muted-foreground">{c.text}</div>
                </div>
              </div>
              <button onClick={() => deleteComment.mutate(c.id)} className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  const [featuresUser, setFeaturesUser] = useState(null);
  const [badgesUser, setBadgesUser] = useState(null);
  const [iconUrl, setIconUrl] = useState('');
  const qc = useQueryClient();

  const { data: iconNote } = useQuery({
    queryKey: ['app-icon-note'],
    queryFn: async () => {
      const notes = await base44.entities.AdminNote.list();
      return notes.find(n => n.title === 'app_icon') || null;
    },
  });

  useEffect(() => {
    if (iconNote) setIconUrl(iconNote.content || '');
  }, [iconNote]);

  const saveIcon = useMutation({
    mutationFn: async () => {
      if (iconNote) {
        return base44.entities.AdminNote.update(iconNote.id, { content: iconUrl });
      } else {
        return base44.entities.AdminNote.create({ title: 'app_icon', content: iconUrl });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-icon-note'] }),
  });

  const { user } = useUser();

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 200),
    initialData: [],
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => base44.entities.SiteReview.list('-created_date', 200),
    initialData: [],
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 100),
    initialData: [],
  });

  const deletePost = useMutation({
    mutationFn: (id) => base44.entities.CommunityPost.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-posts'] }),
  });

  const deleteReview = useMutation({
    mutationFn: (id) => base44.entities.SiteReview.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  const toggleReview = useMutation({
    mutationFn: ({ id, visible }) => base44.entities.SiteReview.update(id, { visible }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  const updateFeature = useMutation({
    mutationFn: ({ userId, features }) => base44.entities.User.update(userId, { premium_features: features }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const handleToggleFeature = (featureId) => {
    if (!featuresUser) return;
    const current = featuresUser.premium_features || {};
    const updated = { ...current, [featureId]: !current[featureId] };
    setFeaturesUser(u => ({ ...u, premium_features: updated }));
    updateFeature.mutate({ userId: featuresUser.id, features: updated });
  };

  const updateBadge = useMutation({
    mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); qc.invalidateQueries({ queryKey: ['me'] }); },
  });

  const handleToggleBadge = (badgeId) => {
    if (!badgesUser) return;
    const current = badgesUser.earned_badges || [];
    const updated = current.includes(badgeId) ? current.filter(b => b !== badgeId) : [...current, badgeId];
    setBadgesUser(u => ({ ...u, earned_badges: updated }));
    updateBadge.mutate({ userId: badgesUser.id, data: { earned_badges: updated } });
  };

  const handleToggleSpecialBadge = (badge) => {
    if (!badgesUser) return;
    if (badge.id === 'admin') {
      const newRole = badgesUser.role === 'admin' ? 'user' : 'admin';
      setBadgesUser(u => ({ ...u, role: newRole }));
      updateBadge.mutate({ userId: badgesUser.id, data: { role: newRole } });
    } else if (badge.id === 'premium') {
      const newVal = !badgesUser.is_premium;
      setBadgesUser(u => ({ ...u, is_premium: newVal }));
      updateBadge.mutate({ userId: badgesUser.id, data: { is_premium: newVal } });
    } else {
      // early_member, first_100 — stored in earned_badges
      const current = badgesUser.earned_badges || [];
      const updated = current.includes(badge.id) ? current.filter(b => b !== badge.id) : [...current, badge.id];
      setBadgesUser(u => ({ ...u, earned_badges: updated }));
      updateBadge.mutate({ userId: badgesUser.id, data: { earned_badges: updated } });
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-3">🚫</div>
          <div className="font-semibold text-foreground">Admin access only</div>
          <div className="text-sm text-muted-foreground mt-1">You don't have permission to view this page.</div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    (u.display_name || u.full_name || '')?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPosts = posts.filter(p =>
    p.author_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.caption?.toLowerCase().includes(search.toLowerCase())
  );

  const premiumCount = users.filter(u => u.is_premium).length;

  const openTickets = tickets.filter(t => t.status !== 'closed');

  const TABS = [
    { id: 'users', label: 'Members', icon: Users, count: users.length },
    { id: 'posts', label: 'Posts', icon: Image, count: posts.length },
    { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
    { id: 'support', label: 'Support', icon: Headphones, count: openTickets.length },
    { id: 'settings', label: 'Settings', icon: Settings2, count: null },
  ];

  return (
    <>
      {featuresUser && (
        <FeaturesModal
          u={featuresUser}
          onClose={() => setFeaturesUser(null)}
          onToggle={handleToggleFeature}
        />
      )}
      {badgesUser && (
        <BadgesModal
          u={badgesUser}
          onClose={() => setBadgesUser(null)}
          onToggleBadge={handleToggleBadge}
          onToggleSpecial={handleToggleSpecialBadge}
        />
      )}
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        description="Manage users and community content."
      />

      {/* Test site link */}
      <div className="mb-6">
        <Link to="/test-site" className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500/20 transition-colors">
          <FlaskConical className="w-4 h-4" />
          Notes & Prompt Pad
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { emoji: '💗', label: 'Members', value: users.length },
          { emoji: '👑', label: 'Premium', value: premiumCount },
          { emoji: '📸', label: 'Posts', value: posts.length },
          { emoji: '🎧', label: 'Open Tickets', value: openTickets.length },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4 text-center">
            <div className="text-xl mb-1">{s.emoji}</div>
            <div className="font-display text-2xl text-primary">{s.value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div className="space-y-3 mb-5">
        <div className="flex gap-1 bg-muted/60 rounded-full p-1 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                tab === t.id ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.count !== null && <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{t.count}</span>}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'users' ? 'Search users…' : tab === 'posts' ? 'Search posts…' : 'Search reviews…'}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-full border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Users — card list on mobile, table on sm+ */}
      {tab === 'users' && (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filteredUsers.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No users found</div>}
            {filteredUsers.map(u => <UserCard key={u.id} u={u} onOpenFeatures={setFeaturesUser} onOpenBadges={setBadgesUser} />)}
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block bg-card rounded-3xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    {['Member', 'Role', 'Joined', 'Premium'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs uppercase tracking-wider text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-10 text-muted-foreground text-sm">No users found</td></tr>
                  )}
                  {filteredUsers.map(u => <UserRow key={u.id} u={u} onOpenFeatures={setFeaturesUser} onOpenBadges={setBadgesUser} />)}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Reviews list */}
      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.filter(r =>
            r.author_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.text?.toLowerCase().includes(search.toLowerCase())
          ).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No reviews yet.</div>
          ) : reviews.filter(r =>
            r.author_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.text?.toLowerCase().includes(search.toLowerCase())
          ).map(r => (
            <div key={r.id} className={`bg-card rounded-2xl border border-border p-5 flex items-start justify-between gap-4 ${!r.visible ? 'opacity-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`w-3.5 h-3.5 ${r.rating >= n ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-primary font-medium">{r.author_name || 'anonymous'}</span>
                  {!r.visible && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">hidden</span>}
                </div>
                <p className="text-sm text-foreground/80 line-clamp-2">{r.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.created_date ? format(new Date(r.created_date), 'MMM d, yyyy') : ''}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleReview.mutate({ id: r.id, visible: !r.visible })}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors" title={r.visible ? 'Hide' : 'Show'}>
                  {r.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteReview.mutate(r.id)}
                  className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Support tickets */}
      {tab === 'support' && <SupportTicketPanel tickets={tickets} />}

      {/* Settings */}
      {tab === 'settings' && (
        <div className="bg-card rounded-3xl border border-border p-6 max-w-lg space-y-4">
          <h3 className="font-semibold text-foreground">App Icon URL</h3>
          <p className="text-xs text-muted-foreground">Paste the URL of your icon image. It will be used as the favicon and home screen icon for all users on next page load.</p>
          {iconUrl && (
            <img src={iconUrl} alt="preview" className="w-16 h-16 rounded-2xl border border-border object-cover" />
          )}
          <div className="flex gap-2">
            <input
              value={iconUrl}
              onChange={e => setIconUrl(e.target.value)}
              placeholder="https://i.imgur.com/youricon.png"
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => saveIcon.mutate()}
              disabled={saveIcon.isPending}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saveIcon.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Posts — card list on mobile, table on sm+ */}
      {tab === 'posts' && (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filteredPosts.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No posts found</div>}
            {filteredPosts.map(p => <PostCard key={p.id} post={p} onDelete={(id) => deletePost.mutate(id)} />)}
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block bg-card rounded-3xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    {['Author', 'Caption', 'Tags', 'Likes', 'Posted', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs uppercase tracking-wider text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPosts.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No posts found</td></tr>
                  )}
                  {filteredPosts.map(p => (
                    <PostRow key={p.id} post={p} onDelete={(id) => deletePost.mutate(id)} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}