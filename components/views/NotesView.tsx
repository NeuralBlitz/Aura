
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Note } from '../../types';
import { storageService } from '../../services/storageService';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { 
  Search, Plus, FileText, Clock, Trash2, Edit3, Globe, Sparkles, BookOpen, X, Tag, 
  Star, Archive, Layout, Wand2, Menu, Loader2, Database, Shield
} from 'lucide-react';

type ViewMode = 'edit' | 'preview';
type Folder = 'inbox' | 'favorites' | 'archive' | 'trash';

const NotesView: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<Folder>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genPrompt, setGenPrompt] = useState('');

  const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId) || null, [notes, activeNoteId]);

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    try {
      const data = await storageService.getAll<Note>('notes');
      setNotes(data.sort((a,b) => b.updatedAt - a.updatedAt));
    } catch (e) {}
  };

  const saveNote = async (note: Note) => {
    const updated = { ...note, updatedAt: Date.now() };
    await storageService.save('notes', updated);
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
  };

  const updateContent = useCallback((id: string, newContent: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content: newContent } : n));
  }, []);

  const persistContent = async (note: Note) => {
     await storageService.save('notes', { ...note, updatedAt: Date.now() });
  };

  const createNote = async () => {
    const newNote: Note = { id: Date.now().toString(), title: 'New Codex Entry', content: '', tags: [], links: [], updatedAt: Date.now() };
    await storageService.save('notes', newNote);
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setViewMode('edit');
    setIsMobileMenuOpen(false);
  };

  const handleAiGenerate = async () => {
    if (!genPrompt.trim()) return;
    setIsAiProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a note about: "${genPrompt}". Return JSON: { "title": "...", "content": "markdown...", "tags": ["tag1"] }`,
        config: { responseMimeType: 'application/json' }
      });
      const data = JSON.parse(response.text);
      const newNote: Note = { id: Date.now().toString(), title: data.title || 'AI Note', content: data.content || '', tags: data.tags || ['ai'], links: [], updatedAt: Date.now() };
      await storageService.save('notes', newNote);
      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      setShowGenModal(false);
      setGenPrompt('');
    } catch (e) {} finally { setIsAiProcessing(false); }
  };

  const toggleTag = (noteId: string, tag: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const newTags = note.tags.includes(tag) ? note.tags.filter(t => t !== tag) : [...note.tags, tag];
    saveNote({ ...note, tags: newTags });
  };

  const deleteNote = async (id: string) => {
    if (activeFolder === 'trash') {
      await storageService.delete('notes', id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (activeNoteId === id) setActiveNoteId(null);
    } else {
      toggleTag(id, 'trash');
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const isTrash = n.tags.includes('trash');
      const isArchive = n.tags.includes('archive');
      const isFavorite = n.tags.includes('favorite');
      let matchesFolder = false;
      if (activeFolder === 'trash') matchesFolder = isTrash;
      else if (activeFolder === 'archive') matchesFolder = isArchive && !isTrash;
      else if (activeFolder === 'favorites') matchesFolder = isFavorite && !isTrash;
      else matchesFolder = !isTrash && !isArchive;
      const q = searchQuery.toLowerCase();
      return matchesFolder && (searchQuery === '' || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    });
  }, [notes, activeFolder, searchQuery]);

  const SidebarItem = ({ id, label, icon: Icon, count }: any) => (
    <button 
      onClick={() => { setActiveFolder(id); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all mb-1 ${activeFolder === id ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/20 shadow-lg' : 'text-neutral-500 hover:bg-white/5 hover:text-white'}`}
    >
      <div className="flex items-center gap-3"><Icon className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">{label}</span></div>
      {count > 0 && <span className="text-[9px] font-mono opacity-50">{count}</span>}
    </button>
  );

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#030303] text-white animate-fade-in font-sans overflow-hidden relative">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* === LEFT: NAVIGATION RAIL === */}
      <div className={`w-72 bg-[#050505] border-r border-white/5 flex-col shrink-0 transition-transform duration-300 z-50 ${isMobileMenuOpen ? 'absolute inset-y-0 left-0 translate-x-0 flex shadow-2xl' : 'absolute inset-y-0 left-0 -translate-x-full md:static md:translate-x-0 md:flex'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-cyan-900/20 rounded-lg border border-cyan-500/20"><BookOpen className="w-5 h-5 text-cyan-500" /></div>
               <div>
                  <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white">Neural Codex</h1>
                  <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest">v4.2 Secure</p>
               </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          
          <button onClick={createNote} className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 transition-all flex items-center justify-center gap-3 mb-3">
            <Plus className="w-4 h-4" /> New Entry
          </button>
          <button onClick={() => setShowGenModal(true)} className="w-full py-4 bg-white/5 text-cyan-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3 mb-8 border border-cyan-500/20">
            <Wand2 className="w-4 h-4" /> AI Draft
          </button>

          <nav className="flex-1 space-y-1">
            <SidebarItem id="inbox" label="Inbox" icon={Layout} count={notes.filter(n => !n.tags.includes('trash') && !n.tags.includes('archive')).length} />
            <SidebarItem id="favorites" label="Favorites" icon={Star} count={notes.filter(n => n.tags.includes('favorite') && !n.tags.includes('trash')).length} />
            <SidebarItem id="archive" label="Archives" icon={Archive} count={notes.filter(n => n.tags.includes('archive') && !n.tags.includes('trash')).length} />
            <SidebarItem id="trash" label="Trash" icon={Trash2} count={notes.filter(n => n.tags.includes('trash')).length} />
          </nav>
          
          <div className="pt-6 border-t border-white/5 mt-4">
             <div className="flex items-center gap-2 text-neutral-600">
                <Database className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Local Encrypted Store</span>
             </div>
          </div>
        </div>
      </div>

      {/* === MIDDLE: INDEX LIST === */}
      <div className={`w-full md:w-80 lg:w-96 bg-[#080808] border-r border-white/5 flex flex-col ${activeNoteId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 space-y-4 shrink-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-cyan-500 transition-colors" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search index..." className="w-full bg-black border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <Globe className="w-12 h-12 text-neutral-500 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">No Data Points</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <button key={note.id} onClick={() => setActiveNoteId(note.id)} className={`w-full text-left p-5 rounded-[1.5rem] border transition-all group relative ${activeNoteId === note.id ? 'metallic-card blue bg-blue-900/10' : 'bg-white/[0.02] border-transparent hover:bg-white/[0.04]'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`text-xs font-black truncate pr-4 ${activeNoteId === note.id ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>{note.title || 'Untitled'}</h4>
                  {note.tags.includes('favorite') && <Star className="w-3 h-3 text-amber-500 fill-current shrink-0" />}
                </div>
                <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed mb-3">{note.content || 'Empty node...'}</p>
                <span className="text-[9px] font-mono text-neutral-600 block">{new Date(note.updatedAt).toLocaleDateString()}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* === RIGHT: EDITOR === */}
      {activeNote ? (
        <div className={`flex-1 flex flex-col bg-[#0A0A0A] relative ${!activeNoteId ? 'hidden md:flex' : 'flex z-20 absolute inset-0 md:static'}`}>
          <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveNoteId(null)} className="md:hidden p-2 text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                 <Shield className="w-3 h-3 text-emerald-500" />
                 <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Secure Edit</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')} className={`p-2.5 rounded-xl border transition-all ${viewMode === 'preview' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-neutral-500 border-white/5'}`}>{viewMode === 'edit' ? <FileText className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}</button>
              <button onClick={() => toggleTag(activeNote.id, 'favorite')} className={`p-2.5 rounded-xl bg-white/5 border border-white/5 transition-all ${activeNote.tags.includes('favorite') ? 'text-amber-500' : 'text-neutral-500'}`}><Star className="w-4 h-4 fill-current" /></button>
              <button onClick={() => deleteNote(activeNote.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-neutral-500 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar relative">
            <div className="max-w-3xl mx-auto py-12 px-8 min-h-full">
              <input value={activeNote.title} onChange={(e) => saveNote({ ...activeNote, title: e.target.value })} placeholder="Untitled Entry" className="w-full bg-transparent text-4xl font-black text-white placeholder-neutral-800 border-none focus:ring-0 p-0 mb-8 tracking-tight" />
              {viewMode === 'edit' ? (
                <textarea value={activeNote.content} onChange={(e) => updateContent(activeNote.id, e.target.value)} onBlur={() => persistContent(activeNote)} placeholder="Begin typing..." className="w-full h-[calc(100vh-300px)] bg-transparent text-lg text-neutral-300 placeholder-neutral-800 font-medium leading-relaxed border-none focus:ring-0 p-0 resize-none outline-none" />
              ) : (
                <div className="prose prose-invert prose-cyan max-w-none"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>{activeNote.content}</ReactMarkdown></div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#0A0A0A] opacity-30">
           <Globe className="w-24 h-24 text-neutral-800 mb-6" />
           <h2 className="text-xl font-black uppercase tracking-[0.5em] text-neutral-700">Codex Idle</h2>
        </div>
      )}

      {/* AI Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
           <div className="metallic-card cyan rounded-[3rem] p-10 max-w-lg w-full shadow-2xl relative">
              <button onClick={() => setShowGenModal(false)} className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-2xl font-black text-white mb-6 tracking-tight">Neural Draft</h3>
              <textarea value={genPrompt} onChange={e => setGenPrompt(e.target.value)} placeholder="Describe topic..." className="w-full h-32 bg-black/40 border border-white/10 rounded-3xl p-5 text-white outline-none mb-6 resize-none" />
              <button onClick={handleAiGenerate} disabled={isAiProcessing || !genPrompt.trim()} className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-cyan-500 transition-all flex items-center justify-center gap-2">{isAiProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Generate</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default NotesView;
