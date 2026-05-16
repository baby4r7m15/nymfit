import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/lib/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Upload, ImageIcon } from 'lucide-react';
import PostCard from '@/components/community/PostCard';
import AuthPromptModal from '@/components/AuthPromptModal';
import DiscoverTab from '@/components/community/DiscoverTab';
import PullToRefresh from '@/components/mobile/PullToRefresh';

const AVATAR_EMOJIS = ['🌸', '🎀', '🌷', '💗', '✨', '🍑', '🌺', '🦋', '🫧', '🩷', '🌙', '💫'];
const SUGGESTED_TAGS = ['glowup', 'transformation', 'softlife', 'progress', 'wellness', 'selfcare', 'femme', 'strength'];

export default function Community() {
  const qc = useQueryClient();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('feed');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    author_name: '',
    avatar_emoji: '🌸',
    caption: '',
    photo_url: '',
    tags: [],
  });

  // Pre-fill name from user profile
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        author_name: user.display_name || user.full_name || '',
        avatar_emoji: user.avatar_emoji || '🌸',
      }));
    }
  }, [user]);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 50),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunityPost.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-posts'] });
      qc.invalidateQueries({ queryKey: ['my-posts'] });
      setShowForm(false);
      setForm(f => ({ ...f, caption: '', photo_url: '', tags: [] }));
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ id, likes }) => base44.entities.CommunityPost.update(id, { likes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community-posts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CommunityPost.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-posts'] });
      qc.invalidateQueries({ queryKey: ['my-posts'] });
    },
  });

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
    setUploading(false);
  };

  const addTag = (t) => {
    const tag = t.trim().toLowerCase().replace(/\s+/g, '');
    if (tag && !form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput('');
  };

  const handleSubmit = () => {
    if (!form.caption.trim()) return;
    createMutation.mutate({
      ...form,
      author_name: form.author_name.trim() || user?.full_name || 'anonymous cutie',
      author_email: user?.email || '',
    });
  };

  const handlePostClick = () => {
    if (!user) { setShowAuthModal(true); return; }
    setShowForm(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AuthPromptModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="font-display text-4xl text-foreground mb-2">community 🌸</div>
        <p className="text-muted-foreground text-sm">share your progress & connect with others ♡</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-2xl p-1 mb-6">
        {[
          { id: 'feed', label: '🌸 Glow-up Wall' },
          { id: 'discover', label: '✨ Discover' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'discover' && <DiscoverTab />}

      {/* Feed tab content */}
      {activeTab === 'feed' && <>

      {/* Post trigger */}
      {!showForm && (
        <motion.button
          onClick={handlePostClick}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="w-full bg-card rounded-3xl border border-dashed border-primary/40 p-5 flex items-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-all mb-6"
        >
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm">share your glow-up story...</span>
        </motion.button>
      )}

      {/* Create post form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="bg-card rounded-3xl border border-border p-6 mb-6">

            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-xl">share your story ✨</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar + name row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative group">
                <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-2xl cursor-pointer">
                  {form.avatar_emoji}
                </div>
                {/* Avatar picker popover */}
                <div className="absolute left-0 top-12 z-10 bg-card border border-border rounded-2xl p-2 shadow-lg hidden group-focus-within:flex flex-wrap gap-1 w-44">
                  {AVATAR_EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm(f => ({ ...f, avatar_emoji: e }))}
                      className={`text-xl p-1.5 rounded-xl transition-all ${form.avatar_emoji === e ? 'bg-accent ring-2 ring-primary' : 'hover:bg-muted'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <input
                  value={form.author_name}
                  onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                  placeholder={user?.display_name || user?.full_name || 'your name / handle'}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Avatar picker row (always visible) */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {AVATAR_EMOJIS.map(e => (
                <button key={e} onClick={() => setForm(f => ({ ...f, avatar_emoji: e }))}
                  className={`text-xl p-1.5 rounded-xl transition-all ${form.avatar_emoji === e ? 'bg-accent ring-2 ring-primary' : 'hover:bg-muted'}`}>
                  {e}
                </button>
              ))}
            </div>

            {/* Caption */}
            <textarea
              placeholder="tell us your story 🌸 progress, feelings, wins big & small..."
              rows={4}
              value={form.caption}
              onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
              className="w-full bg-muted rounded-2xl px-4 py-3 text-sm border border-border focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground resize-none mb-3"
            />

            {/* Photo */}
            <div className="mb-4">
              {form.photo_url ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={form.photo_url} alt="preview" className="w-full h-48 object-cover" />
                  <button onClick={() => setForm(f => ({ ...f, photo_url: '' }))}
                    className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-1.5 rounded-full">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground bg-muted rounded-2xl p-3.5 hover:bg-muted/80 transition-colors border border-border border-dashed">
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  {uploading ? 'uploading...' : 'add a progress photo (optional)'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
              )}
            </div>

            {/* Tags */}
            <div className="mb-5">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {SUGGESTED_TAGS.map(t => (
                  <button key={t} onClick={() => addTag(t)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      form.tags.includes(t)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                    }`}>
                    #{t}
                  </button>
                ))}
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.filter(t => !SUGGESTED_TAGS.includes(t)).map(t => (
                    <span key={t} className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full flex items-center gap-1">
                      #{t}
                      <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  placeholder="custom tag..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                  className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
                <button onClick={() => addTag(tagInput)} className="text-sm px-4 bg-muted rounded-xl border border-border hover:bg-border transition-colors">add</button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !form.caption.trim()}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createMutation.isPending ? 'posting...' : 'share with the community ♡'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed */}
      <PullToRefresh onRefresh={() => qc.invalidateQueries({ queryKey: ['community-posts'] })}>
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">loading stories...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌱</div>
            <div className="text-muted-foreground text-sm">be the first to share your glow-up story!</div>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <PostCard post={post} likeMutation={likeMutation} onDelete={(id) => deleteMutation.mutate(id)} />
              </motion.div>
            ))}
          </div>
        )}
      </PullToRefresh>

      </>}
    </div>
  );
}