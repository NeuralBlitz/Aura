
import React, { useState, useEffect, useMemo } from 'react';
import { Project, Task, ProjectMember, TaskComment } from '../../types';
import { storageService } from '../../services/storageService';
import { GoogleGenAI } from "@google/genai";
import ModuleLayout from '../ui/ModuleLayout';
import MemberAvatar from '../ui/MemberAvatar';
import PriorityBadge from '../ui/PriorityBadge';
import { 
  Plus, Trash2, CheckCircle2, Circle, 
  ListChecks, Search, X, Tag,
  ArrowUp, Minus, ArrowDown,
  Users, MessageSquare, Calendar,
  Sparkles, Wand2, MoreHorizontal,
  Check, ChevronRight, Layout, Send,
  FolderKanban, Settings, ChevronLeft,
  Briefcase, UserPlus, Filter, SortAsc, Clock, AlertCircle
} from 'lucide-react';

// --- Main View ---

const ProjectsView: React.FC = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Creation States
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // AI & UI State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMember, setFilterMember] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'newest'>('newest');
  
  // Task Editing Modal
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');

  // Initial Data & Loading
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await storageService.getAll<Project>('projects');
    if (data.length > 0) {
      setProjects(data);
      setActiveProject(data[0]);
    } else {
      createDefaultProject();
    }
  };

  const createDefaultProject = async () => {
    const defaultMembers: ProjectMember[] = [
      { id: 'u1', name: 'You', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=You', role: 'owner' },
      { id: 'u2', name: 'Aura', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aura', role: 'admin' },
    ];

    const newProj: Project = {
      id: Date.now().toString(),
      title: 'Nexus Launch Protocol',
      description: 'Strategic roadmap for the deployment of the Nexus core.',
      members: defaultMembers,
      updatedAt: Date.now(),
      tasks: [
        { 
          id: 't1', title: 'Initialize Repository', status: 'done', priority: 'high', tags: ['dev', 'core'], 
          description: 'Set up the git repo and CI/CD pipelines.',
          assignees: ['u1'], subtasks: [{ id: 's1', title: 'Git init', completed: true }, { id: 's2', title: 'Actions config', completed: true }],
          comments: [], dueDate: Date.now() + 86400000 * 2
        },
        { 
          id: 't2', title: 'Design System Audit', status: 'doing', priority: 'medium', tags: ['design'], 
          description: 'Review current component library for consistency.',
          assignees: ['u2'], subtasks: [{ id: 's3', title: 'Check colors', completed: true }, { id: 's4', title: 'Check typography', completed: false }],
          comments: [], dueDate: Date.now() + 86400000 * 5
        }
      ]
    };
    await storageService.save('projects', newProj);
    setProjects([newProj]);
    setActiveProject(newProj);
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;
    const newProj: Project = {
      id: Date.now().toString(),
      title: newProjectTitle,
      description: newProjectDesc || 'No description provided.',
      members: [{ id: 'u1', name: 'You', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=You', role: 'owner' }],
      updatedAt: Date.now(),
      tasks: []
    };
    await storageService.save('projects', newProj);
    setProjects([...projects, newProj]);
    setActiveProject(newProj);
    setIsCreatingProject(false);
    setNewProjectTitle('');
    setNewProjectDesc('');
  };

  const deleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await storageService.delete('projects', id);
      const remaining = projects.filter(p => p.id !== id);
      setProjects(remaining);
      setActiveProject(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleAddMember = () => {
    if (!activeProject || !newMemberName.trim()) return;
    const newMember: ProjectMember = {
      id: Date.now().toString(),
      name: newMemberName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${newMemberName}`,
      role: 'viewer'
    };
    const updated = { ...activeProject, members: [...activeProject.members, newMember] };
    updateProject(updated);
    setNewMemberName('');
    setIsAddingMember(false);
  };

  const updateProject = (proj: Project) => {
    const updated = { ...proj, updatedAt: Date.now() };
    setActiveProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    storageService.save('projects', updated);
  };

  // --- AI Generation ---

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a project manager. Create a list of 4-6 concrete tasks to achieve this goal: "${aiPrompt}". 
        For each task, provide a title, a short description, priority (low/medium/high), tags (array of strings), and 2-3 subtasks.
        Return ONLY valid JSON array structure: [{ "title": "...", "description": "...", "priority": "high", "tags": [], "subtasks": [{"title": "..."}] }]`,
        config: { responseMimeType: 'application/json' }
      });

      const tasksData = JSON.parse(response.text);
      const newTasks: Task[] = tasksData.map((t: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: t.title,
        description: t.description,
        priority: t.priority.toLowerCase(),
        status: 'todo',
        tags: t.tags || ['ai-gen'],
        assignees: [],
        comments: [],
        subtasks: t.subtasks?.map((s: any) => ({ id: Math.random().toString(36).substr(2, 9), title: s.title, completed: false })) || [],
        dueDate: Date.now() + 86400000 * (Math.floor(Math.random() * 7) + 1) // Random due date within a week
      }));

      if (activeProject) {
        const updated = { ...activeProject, tasks: [...activeProject.tasks, ...newTasks] };
        updateProject(updated);
      }
      setAiPrompt('');
      setShowAiModal(false);
    } catch (e) {
      console.error("AI Gen Error", e);
      alert("Failed to generate tasks. Please try again.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // --- Task Management ---

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (!activeProject || !taskId) return;
    
    const updatedTasks = activeProject.tasks.map(t => 
      t.id === taskId ? { ...t, status } : t
    );
    updateProject({ ...activeProject, tasks: updatedTasks });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    if (!activeProject) return;
    const updatedTasks = activeProject.tasks.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks?.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
      };
    });
    const proj = { ...activeProject, tasks: updatedTasks };
    if (editingTask && editingTask.id === taskId) {
       setEditingTask(proj.tasks.find(t => t.id === taskId) || null);
    }
    updateProject(proj);
  };

  const addComment = (taskId: string) => {
    if (!activeProject || !newComment.trim()) return;
    
    // Simulate current user (using first member for now, usually 'You')
    const currentUser = activeProject.members[0] || { id: 'anon', name: 'Anonymous', avatar: '' };

    const comment: TaskComment = {
      id: Date.now().toString(),
      userId: currentUser.id, 
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: newComment,
      timestamp: Date.now()
    };
    
    const updatedTasks = activeProject.tasks.map(t => 
      t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t
    );
    const proj = { ...activeProject, tasks: updatedTasks };
    setEditingTask(proj.tasks.find(t => t.id === taskId) || null);
    updateProject(proj);
    setNewComment('');
  };

  // --- Filtering & Sorting Logic ---

  const filteredTasks = useMemo(() => {
    if (!activeProject) return [];
    
    let filtered = activeProject.tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
      const matchesMember = filterMember === 'all' ? true : t.assignees?.includes(filterMember);
      const matchesPriority = filterPriority === 'all' ? true : t.priority === filterPriority;
      return matchesSearch && matchesMember && matchesPriority;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'date') return (a.dueDate || Infinity) - (b.dueDate || Infinity);
      if (sortBy === 'priority') {
        const pMap = { high: 3, medium: 2, low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      // Newest (using string ID timestamp approx or if tasks had createdAt)
      return parseInt(b.id) - parseInt(a.id); 
    });
  }, [activeProject, searchQuery, filterMember, filterPriority, sortBy]);

  return (
    <ModuleLayout title="Workspaces" subtitle="Project Management" status="SYNCED" icon={Briefcase} color="blue">
      <div className="flex h-full w-full bg-black/20 overflow-hidden">
        
        {/* --- Projects Sidebar --- */}
        <div className={`border-r border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-300 flex flex-col shrink-0 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              Workspaces
           </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {projects.map(proj => (
              <div
                key={proj.id}
                onClick={() => setActiveProject(proj)}
                className={`w-full text-left p-3 rounded-xl border transition-all group relative cursor-pointer ${activeProject?.id === proj.id ? 'bg-blue-600/10 border-blue-500/30' : 'border-transparent hover:bg-white/5'}`}
              >
                 <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold truncate ${activeProject?.id === proj.id ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>{proj.title}</span>
                    {activeProject?.id === proj.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                 </div>
                 <p className="text-[10px] text-neutral-600 truncate mt-1">{proj.tasks.length} active tasks</p>
                 
                 {activeProject?.id === proj.id && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }}
                      className="absolute right-2 bottom-2 p-1 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                       <Trash2 className="w-3 h-3" />
                    </button>
                 )}
              </div>
           ))}
        </div>

        <div className="p-4 border-t border-white/5">
           <button 
             onClick={() => setIsCreatingProject(true)}
             className="w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 text-neutral-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
           >
              <Plus className="w-3 h-3" /> Create Project
           </button>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-6 left-4 z-20 p-2 rounded-lg bg-black/50 border border-white/10 text-neutral-500 hover:text-white transition-all ${isSidebarOpen ? 'hidden' : 'block'}`}
        >
           <Layout className="w-4 h-4" />
        </button>

        {!activeProject ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <FolderKanban className="w-16 h-16 text-neutral-800 mb-6" />
              <h2 className="text-xl font-black text-neutral-700 uppercase tracking-widest">No Active Workspace</h2>
              <p className="text-xs text-neutral-600 mt-2">Select a project from the sidebar or create a new one.</p>
              <button 
                onClick={() => setIsCreatingProject(true)}
                className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest"
              >
                 Create New Project
              </button>
           </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="pt-6 px-8 pb-4 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md shrink-0 flex flex-col">
               <div className="flex items-start justify-between gap-6 mb-6">
                  <div className="flex items-start gap-4">
                     <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mt-1 p-2 hover:bg-white/5 rounded-lg text-neutral-500 transition-colors hidden md:block">
                        {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                     </button>
                     <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter italic flex items-center gap-3">
                           {activeProject.title}
                           <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-neutral-500 not-italic border border-white/5 uppercase tracking-widest">
                              {activeProject.tasks.length} Tasks
                           </span>
                        </h1>
                        <p className="text-sm text-neutral-500 font-medium max-w-xl mt-1">{activeProject.description}</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => setShowAiModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95"
                  >
                     <Wand2 className="w-4 h-4" /> Generate Tasks
                  </button>
               </div>

               {/* Toolbar / Filters */}
               <div className="flex flex-wrap items-center gap-4 py-2">
                  <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2">
                     <Search className="w-3.5 h-3.5 text-neutral-500" />
                     <input 
                       type="text" 
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                       placeholder="Filter..."
                       className="bg-transparent border-none text-xs text-white focus:ring-0 w-24 placeholder-neutral-600 p-0"
                     />
                  </div>

                  <div className="h-6 w-px bg-white/10" />

                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Sort:</span>
                     <select 
                       value={sortBy} 
                       onChange={(e) => setSortBy(e.target.value as any)}
                       className="bg-transparent text-xs font-bold text-white border-none focus:ring-0 cursor-pointer"
                     >
                        <option value="newest">Newest</option>
                        <option value="date">Due Date</option>
                        <option value="priority">Priority</option>
                     </select>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Priority:</span>
                     <select 
                       value={filterPriority} 
                       onChange={(e) => setFilterPriority(e.target.value)}
                       className="bg-transparent text-xs font-bold text-white border-none focus:ring-0 cursor-pointer"
                     >
                        <option value="all">All</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                     </select>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Assignee:</span>
                     <select 
                       value={filterMember} 
                       onChange={(e) => setFilterMember(e.target.value)}
                       className="bg-transparent text-xs font-bold text-white border-none focus:ring-0 cursor-pointer"
                     >
                        <option value="all">All</option>
                        {activeProject.members.map(m => (
                           <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                     </select>
                  </div>

                  <div className="flex-1" />
                  
                  <div className="flex -space-x-2">
                     {activeProject.members.map(m => (
                       <MemberAvatar key={m.id} member={m} className="hover:scale-110 transition-transform cursor-pointer" />
                     ))}
                     <button 
                       onClick={() => setIsAddingMember(true)}
                       className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-neutral-400 group"
                     >
                        <Plus className="w-3 h-3 group-hover:text-white" />
                     </button>
                  </div>
               </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
               <div className="flex gap-6 h-full min-w-max">
                  {['todo', 'doing', 'review', 'done'].map(status => (
                     <div 
                       key={status}
                       onDragOver={(e) => e.preventDefault()}
                       onDrop={(e) => handleDrop(e, status as Task['status'])}
                       className="w-80 flex flex-col h-full"
                     >
                        <div className="flex items-center justify-between mb-4 px-2">
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${status === 'todo' ? 'bg-neutral-500' : status === 'doing' ? 'bg-blue-500' : status === 'review' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">{status}</span>
                           </div>
                           <span className="text-[10px] font-bold text-neutral-600 bg-white/5 px-2 py-0.5 rounded-md">
                              {filteredTasks.filter(t => t.status === status).length}
                           </span>
                        </div>

                        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[2rem] p-4 flex flex-col gap-3 overflow-y-auto no-scrollbar">
                           {filteredTasks.filter(t => t.status === status).map(task => {
                              const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                              const totalSubtasks = task.subtasks?.length || 0;
                              const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
                              
                              const isOverdue = task.dueDate && Date.now() > task.dueDate && task.status !== 'done';

                              return (
                                 <div 
                                   key={task.id}
                                   draggable
                                   onDragStart={(e) => handleDragStart(e, task.id)}
                                   onClick={() => setEditingTask(task)}
                                   className="bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-white/5 hover:border-blue-500/30 rounded-[1.5rem] p-5 cursor-pointer group transition-all active:scale-[0.98] shadow-sm relative overflow-hidden"
                                 >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'} opacity-50`} />
                                    
                                    <div className="flex justify-between items-start mb-3 pl-2">
                                       <PriorityBadge priority={task.priority} />
                                       {task.assignees && task.assignees.length > 0 && (
                                          <div className="flex -space-x-2">
                                             {task.assignees.slice(0, 3).map(uid => {
                                                const member = activeProject.members.find(m => m.id === uid);
                                                return <MemberAvatar key={uid} member={member} size="sm" />;
                                             })}
                                          </div>
                                       )}
                                    </div>

                                    <h4 className="text-sm font-bold text-neutral-200 mb-2 pl-2 leading-snug group-hover:text-white transition-colors">{task.title}</h4>
                                    
                                    <div className="pl-2 flex items-center gap-2 flex-wrap mb-4">
                                       {task.tags.slice(0, 3).map(tag => (
                                          <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-neutral-500 bg-white/5 px-2 py-1 rounded-md">#{tag}</span>
                                       ))}
                                    </div>

                                    <div className="pl-2 pt-3 border-t border-white/5 flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                          <div className="flex items-center gap-1 text-neutral-500">
                                             <ListChecks className="w-3 h-3" />
                                             <span className="text-[9px] font-bold">{completedSubtasks}/{totalSubtasks}</span>
                                          </div>
                                          {task.comments && task.comments.length > 0 && (
                                             <div className="flex items-center gap-1 text-neutral-500">
                                                <MessageSquare className="w-3 h-3" />
                                                <span className="text-[9px] font-bold">{task.comments.length}</span>
                                             </div>
                                          )}
                                       </div>
                                       {task.dueDate && (
                                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-neutral-500'}`}>
                                             {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                                             <span className="text-[9px] font-bold">{new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                          </div>
                                       )}
                                    </div>
                                    {totalSubtasks > 0 && (
                                       <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                                          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                       </div>
                                    )}
                                 </div>
                              );
                           })}
                           <button 
                             onClick={() => {
                                const newTask: Task = { id: Date.now().toString(), title: 'New Task', status: status as any, priority: 'medium', tags: [], subtasks: [], comments: [], assignees: [], dueDate: Date.now() + 86400000 };
                                const updated = { ...activeProject, tasks: [...activeProject.tasks, newTask] };
                                updateProject(updated);
                                setEditingTask(newTask);
                             }}
                             className="p-3 border-2 border-dashed border-white/5 rounded-2xl text-neutral-600 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                           >
                              <Plus className="w-4 h-4" /> Add Task
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Modals --- */}

      {/* Create Project Modal */}
      {isCreatingProject && (
         <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-scale-in">
               <h3 className="text-xl font-black text-white mb-6">Initialize New Project</h3>
               <div className="space-y-4">
                  <div>
                     <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-2 mb-1 block">Project Title</label>
                     <input 
                       autoFocus
                       value={newProjectTitle}
                       onChange={e => setNewProjectTitle(e.target.value)}
                       placeholder="e.g. Apollo Launch"
                       className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500/50 outline-none"
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-2 mb-1 block">Description</label>
                     <textarea 
                       value={newProjectDesc}
                       onChange={e => setNewProjectDesc(e.target.value)}
                       placeholder="Brief objective..."
                       className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500/50 outline-none resize-none h-24"
                     />
                  </div>
                  <div className="flex gap-3 pt-2">
                     <button onClick={() => setIsCreatingProject(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-neutral-400 hover:text-white text-xs font-bold transition-colors">Cancel</button>
                     <button onClick={handleCreateProject} disabled={!newProjectTitle.trim()} className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors disabled:opacity-50">Create</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Add Member Modal */}
      {isAddingMember && (
         <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-scale-in">
               <div className="flex items-center gap-3 mb-6">
                  <UserPlus className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-black text-white">Add Team Member</h3>
               </div>
               <input 
                 autoFocus
                 value={newMemberName}
                 onChange={e => setNewMemberName(e.target.value)}
                 placeholder="Member Name"
                 className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500/50 outline-none mb-6"
                 onKeyDown={e => e.key === 'Enter' && handleAddMember()}
               />
               <div className="flex gap-3">
                  <button onClick={() => setIsAddingMember(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-neutral-400 hover:text-white text-xs font-bold">Cancel</button>
                  <button onClick={handleAddMember} disabled={!newMemberName.trim()} className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-500">Add</button>
               </div>
            </div>
         </div>
      )}

      {/* Task Detail Modal */}
      {editingTask && activeProject && (
         <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex justify-end animate-fade-in">
            <div className="w-full max-w-2xl bg-[#0A0A0A] border-l border-white/10 h-full shadow-2xl flex flex-col animate-slide-left">
               {/* Modal Header */}
               <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-neutral-900/50">
                  <div className="flex items-center gap-3">
                     <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center gap-2
                        ${editingTask.status === 'done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                        {editingTask.status}
                     </div>
                     <PriorityBadge priority={editingTask.priority} />
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => {
                        const filtered = activeProject.tasks.filter(t => t.id !== editingTask.id);
                        updateProject({ ...activeProject, tasks: filtered });
                        setEditingTask(null);
                     }} className="p-2 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                     <div className="h-4 w-px bg-white/10 mx-2" />
                     <button onClick={() => setEditingTask(null)} className="p-2 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               {/* Modal Body */}
               <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                  {/* Title & Desc */}
                  <div className="space-y-4">
                     <input 
                        value={editingTask.title}
                        onChange={(e) => {
                           const updated = { ...editingTask, title: e.target.value };
                           setEditingTask(updated);
                           updateProject({ ...activeProject, tasks: activeProject.tasks.map(t => t.id === updated.id ? updated : t) });
                        }}
                        className="w-full bg-transparent text-2xl font-black text-white focus:outline-none placeholder-neutral-700"
                        placeholder="Task Title"
                     />
                     <textarea 
                        value={editingTask.description || ''}
                        onChange={(e) => {
                           const updated = { ...editingTask, description: e.target.value };
                           setEditingTask(updated);
                           updateProject({ ...activeProject, tasks: activeProject.tasks.map(t => t.id === updated.id ? updated : t) });
                        }}
                        className="w-full bg-transparent text-sm font-medium text-neutral-400 focus:text-neutral-200 focus:outline-none resize-none h-24 placeholder-neutral-700"
                        placeholder="Add a detailed description..."
                     />
                  </div>

                  {/* Properties Grid */}
                  <div className="grid grid-cols-2 gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                     <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 flex items-center gap-2"><Calendar className="w-3 h-3" /> Due Date</span>
                        <input 
                           type="date"
                           value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                           onChange={(e) => {
                              const newDate = e.target.value ? new Date(e.target.value).getTime() : undefined;
                              const updated = { ...editingTask, dueDate: newDate };
                              setEditingTask(updated);
                              updateProject({ ...activeProject, tasks: activeProject.tasks.map(t => t.id === updated.id ? updated : t) });
                           }}
                           className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500/50 outline-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 flex items-center gap-2"><Tag className="w-3 h-3" /> Priority</span>
                        <div className="flex gap-2">
                           {['low', 'medium', 'high'].map((p) => (
                              <button 
                                key={p}
                                onClick={() => {
                                   const updated = { ...editingTask, priority: p as any };
                                   setEditingTask(updated);
                                   updateProject({ ...activeProject, tasks: activeProject.tasks.map(t => t.id === updated.id ? updated : t) });
                                }}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all border ${editingTask.priority === p ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-neutral-600 border-white/5'}`}
                              >
                                 {p}
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 flex items-center gap-2"><Users className="w-3 h-3" /> Assignees</span>
                        <div className="flex flex-wrap gap-2">
                           {activeProject.members.map(m => (
                              <button 
                                key={m.id}
                                onClick={() => {
                                   const current = editingTask.assignees || [];
                                   const newAssignees = current.includes(m.id) ? current.filter(id => id !== m.id) : [...current, m.id];
                                   const updated = { ...editingTask, assignees: newAssignees };
                                   setEditingTask(updated);
                                   updateProject({ ...activeProject, tasks: activeProject.tasks.map(t => t.id === updated.id ? updated : t) });
                                }}
                                className={`p-1 rounded-full border-2 transition-all ${editingTask.assignees?.includes(m.id) ? 'border-blue-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                              >
                                 <MemberAvatar member={m} size="sm" />
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 flex items-center gap-2"><Tag className="w-3 h-3" /> Tags</span>
                        <div className="flex flex-wrap gap-2">
                           {['core', 'frontend', 'backend', 'design', 'qa'].map(tag => (
                              <button 
                                key={tag}
                                onClick={() => {
                                   const current = editingTask.tags;
                                   const newTags = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
                                   const updated = { ...editingTask, tags: newTags };
                                   setEditingTask(updated);
                                   updateProject({ ...activeProject, tasks: activeProject.tasks.map(t => t.id === updated.id ? updated : t) });
                                }}
                                className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border transition-all ${editingTask.tags.includes(tag) ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-neutral-600 border-white/5'}`}
                              >
                                 #{tag}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Subtasks */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                           <ListChecks className="w-4 h-4" /> Subtasks
                        </h4>
                        <span className="text-[10px] font-bold text-neutral-600">
                           {editingTask.subtasks?.filter(s => s.completed).length || 0} / {editingTask.subtasks?.length || 0}
                        </span>
                     </div>
                     
                     <div className="space-y-2">
                        {editingTask.subtasks?.map(sub => (
                           <div key={sub.id} className="flex items-center gap-3 group">
                              <button 
                                onClick={() => toggleSubtask(editingTask.id, sub.id)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${sub.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/20 text-transparent hover:border-white/40'}`}
                              >
                                 <Check className="w-3 h-3" />
                              </button>
                              <input 
                                value={sub.title}
                                onChange={(e) => {
                                   const updatedSubtasks = editingTask.subtasks?.map(s => s.id === sub.id ? { ...s, title: e.target.value } : s);
                                   const updated = { ...editingTask, subtasks: updatedSubtasks };
                                   setEditingTask(updated);
                                   updateProject({ ...activeProject, tasks: activeProject.tasks.map(t => t.id === updated.id ? updated : t) });
                                }}
                                className={`flex-1 bg-transparent text-sm font-medium focus:outline-none ${sub.completed ? 'text-neutral-600 line-through' : 'text-neutral-300'}`}
                              />
                              <button 
                                onClick={() => {
                                   const updatedSubtasks = editingTask.subtasks?.filter(s => s.id !== sub.id);
                                   const updated = { ...editingTask, subtasks: updatedSubtasks };
                                   setEditingTask(updated);
                                   updateProject({ ...activeProject, tasks: activeProject.tasks.map(t => t.id === updated.id ? updated : t) });
                                }}
                                className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500 transition-all"
                              >
                                 <X className="w-3 h-3" />
                              </button>
                           </div>
                        ))}
                        <button 
                          onClick={() => {
                             const newSub = { id: Date.now().toString(), title: '', completed: false };
                             const updated = { ...editingTask, subtasks: [...(editingTask.subtasks || []), newSub] };
                             setEditingTask(updated);
                             updateProject({ ...activeProject, tasks: activeProject.tasks.map(t => t.id === updated.id ? updated : t) });
                          }}
                          className="flex items-center gap-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 mt-2"
                        >
                           <Plus className="w-3 h-3" /> Add Item
                        </button>
                     </div>
                  </div>

                  {/* Activity / Comments */}
                  <div className="pt-8 border-t border-white/5 space-y-6">
                     <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Discussion
                     </h4>
                     
                     <div className="space-y-6">
                        {editingTask.comments?.map(comment => (
                           <div key={comment.id} className="flex gap-4 group">
                              <img src={comment.userAvatar} className="w-8 h-8 rounded-full border border-white/10 shrink-0" alt="User" />
                              <div className="flex-1">
                                 <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-xs font-bold text-white">{comment.userName}</span>
                                    <span className="text-[9px] font-medium text-neutral-600">{new Date(comment.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                 </div>
                                 <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3 text-xs text-neutral-300 leading-relaxed group-hover:bg-white/10 transition-colors">
                                    {comment.text}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="flex gap-3 items-end sticky bottom-0 bg-[#0A0A0A] pt-4 border-t border-white/5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">Y</div>
                        <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-2 focus-within:border-white/20 transition-all flex gap-2">
                           <textarea 
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="flex-1 bg-transparent text-xs text-white placeholder-neutral-600 focus:outline-none resize-none h-10 py-2.5 px-2"
                              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(editingTask.id); }}}
                           />
                           <button 
                              onClick={() => addComment(editingTask.id)}
                              disabled={!newComment.trim()}
                              className="p-2 bg-blue-600 rounded-xl text-white disabled:opacity-50 hover:bg-blue-500 transition-colors shrink-0"
                           >
                              <Send className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-scale-in">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                    <Sparkles className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-white">Neural Task Generator</h3>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Powered by Gemini 3 Pro</p>
                 </div>
              </div>
              <textarea 
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Describe your goal (e.g., 'Launch a Q3 marketing campaign')..."
                className="w-full h-32 bg-black border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 outline-none resize-none mb-6"
              />
              <div className="flex gap-3">
                 <button onClick={() => setShowAiModal(false)} className="flex-1 py-4 rounded-xl bg-white/5 text-neutral-400 hover:text-white font-bold text-xs transition-colors">Cancel</button>
                 <button 
                   onClick={handleAiGenerate}
                   disabled={isAiGenerating || !aiPrompt.trim()}
                   className="flex-[2] py-4 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                 >
                    {isAiGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {isAiGenerating ? 'Synthesizing...' : 'Generate Tasks'}
                 </button>
              </div>
           </div>
        </div>
      )}
      </div>
    </ModuleLayout>
  );
};

export default ProjectsView;
