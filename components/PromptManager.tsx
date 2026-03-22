
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Play, X, Save, MessageSquare, Sparkles } from 'lucide-react';
import { CustomPrompt } from '../types';
import { db, auth } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface PromptManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const PromptManager: React.FC<PromptManagerProps> = ({ isOpen, onClose, onSelectPrompt }) => {
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser || !isOpen) return;

    const q = query(
      collection(db, 'custom_prompts'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPrompts: CustomPrompt[] = [];
      snapshot.forEach((doc) => {
        loadedPrompts.push({ id: doc.id, ...doc.data() } as CustomPrompt);
      });
      setPrompts(loadedPrompts.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleSave = async () => {
    if (!auth.currentUser || !newName.trim() || !newPrompt.trim()) return;
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'custom_prompts'), {
        userId: auth.currentUser.uid,
        name: newName.trim(),
        prompt: newPrompt.trim(),
        createdAt: Date.now()
      });
      setNewName('');
      setNewPrompt('');
      setIsAdding(false);
    } catch (error) {
      console.error("Error saving prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'custom_prompts', id));
    } catch (error) {
      console.error("Error deleting prompt:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-morphic bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/20">
                <Sparkles className="w-5 h-5 text-blue-400" />
             </div>
             <div>
                <h2 className="text-lg font-black text-white tracking-tight">Custom Prompts</h2>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Neural Templates</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {isAdding ? (
            <div className="space-y-4 animate-scale-in">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Prompt Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Code Reviewer, Story Starter..."
                  className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Neural Instructions</label>
                <textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Enter the system instructions or pre-filled prompt..."
                  rows={4}
                  className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 bg-white/5 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !newName.trim() || !newPrompt.trim()}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Template
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-4 border-2 border-dashed border-white/10 rounded-3xl text-neutral-500 hover:text-blue-400 hover:border-blue-500/40 transition-all flex flex-col items-center gap-2 group"
            >
              <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Create New Template</span>
            </button>
          )}

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700 px-2">Saved Matrix</h3>
            {prompts.length === 0 ? (
              <div className="text-center py-12 opacity-30">
                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No templates found</p>
              </div>
            ) : (
              prompts.map((p) => (
                <div key={p.id} className="group relative glass-morphic bg-white/[0.02] border border-white/5 hover:border-blue-500/30 p-5 rounded-3xl transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-black text-white tracking-tight mb-1">{p.name}</h4>
                      <p className="text-[10px] text-neutral-600 font-mono line-clamp-2">{p.prompt}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onSelectPrompt(p.prompt);
                          onClose();
                        }}
                        className="p-2.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2.5 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-neutral-700">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                    Created {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptManager;
