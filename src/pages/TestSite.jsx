import React, { useState } from 'react';
import { useUser } from '@/lib/UserContext';
import { Link } from 'react-router-dom';
import { Send, Loader2, Plus, Trash2, Save, Check, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function NotesPage() {
  const { user } = useUser();
  const qc = useQueryClient();

  const [activeNote, setActiveNote] = useState(null); // null = list view
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptResponse, setPromptResponse] = useState('');

  const { data: notes = [] } = useQuery({
    queryKey: ['admin-notes'],
    queryFn: () => base44.entities.AdminNote.list('-updated_date', 100),
    initialData: [],
    enabled: user?.role === 'admin',
  });

  const createNote = useMutation({
    mutationFn: () => base44.entities.AdminNote.create({ title: 'Untitled', content: '' }),
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: ['admin-notes'] });
      setActiveNote(note);
      setEditTitle('Untitled');
      setEditContent('');
      setPromptResponse('');
    },
  });

  const saveNote = useMutation({
    mutationFn: ({ id, title, content }) => base44.entities.AdminNote.update(id, { title, content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notes'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    },
  });

  const deleteNote = useMutation({
    mutationFn: (id) => base44.entities.AdminNote.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notes'] });
      setActiveNote(null);
    },
  });

  const openNote = (note) => {
    setActiveNote(note);
    setEditTitle(note.title || '');
    setEditContent(note.content || '');
    setPromptResponse('');
  };

  const handleSend = async () => {
    if (!editContent.trim()) return;
    setPromptLoading(true);
    setPromptResponse('');
    const res = await base44.integrations.Core.InvokeLLM({ prompt: editContent });
    setPromptResponse(res);
    setPromptLoading(false);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-3">🚫</div>
          <div className="font-semibold text-foreground">Admin access only</div>
        </div>
      </div>
    );
  }

  // ── EDITOR VIEW ──────────────────────────────────────────────
  if (activeNote) {
    return (
      <div className="flex flex-col h-[calc(100dvh-8rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3 shrink-0">
          <button
            onClick={() => setActiveNote(null)}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Note title..."
            className="flex-1 bg-transparent font-display text-xl text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
          />
          <button
            onClick={() => saveNote.mutate({ id: activeNote.id, title: editTitle, content: editContent })}
            disabled={saveNote.isPending}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved!' : 'Save'}
          </button>
          <button
            onClick={() => deleteNote.mutate(activeNote.id)}
            className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Textarea — fills remaining space */}
        <textarea
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          placeholder="Type your notes or a prompt here..."
          className="flex-1 bg-card rounded-3xl border border-border px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
        />

        {/* AI Prompt bar */}
        <div className="mt-3 shrink-0 space-y-3">
          <button
            onClick={handleSend}
            disabled={promptLoading || !editContent.trim()}
            className="w-full flex items-center justify-center gap-2 bg-muted text-foreground px-5 py-3 rounded-2xl font-medium text-sm hover:bg-border transition-colors disabled:opacity-50 disabled:pointer-events-none border border-border"
          >
            {promptLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {promptLoading ? 'Thinking...' : 'Send as AI prompt'}
          </button>

          {promptResponse && (
            <div className="bg-card rounded-2xl border border-border p-4 max-h-40 overflow-y-auto">
              <div className="text-[11px] tracking-[0.2em] uppercase text-primary/80 mb-2">AI Response</div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{promptResponse}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">← Admin</Link>
          <h1 className="font-display text-2xl text-foreground">Notes ✍️</h1>
        </div>
        <button
          onClick={() => createNote.mutate()}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New note
        </button>
      </div>

      {/* Notes grid */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="text-4xl mb-3">📝</div>
            <div className="text-sm">No notes yet — create one!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {notes.map(n => (
              <button
                key={n.id}
                onClick={() => openNote(n)}
                className="text-left bg-card rounded-2xl border border-border p-4 hover:border-primary/40 hover:bg-accent transition-all"
              >
                <div className="font-semibold text-foreground text-sm truncate mb-1">{n.title || 'Untitled'}</div>
                <div className="text-xs text-muted-foreground line-clamp-3">{n.content || '—'}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}