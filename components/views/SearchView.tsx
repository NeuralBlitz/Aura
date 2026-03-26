
import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Github, Cpu, Database, Network, Workflow, Terminal, Layers, Zap, Library, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface SearchViewProps {
  onNavigateToScriptorium?: () => void;
}

const SearchView: React.FC<SearchViewProps> = ({ onNavigateToScriptorium }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search for information about: ${query}. Provide a concise summary and list key findings with sources.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      const searchResults = chunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Search Result',
        url: chunk.web?.uri,
        summary: text.substring(0, 200) + '...', // Simplified summary from the model's text
      })).filter((res: any) => res.url) || [];

      setResults(searchResults);
      if (searchResults.length === 0 && text) {
        // If no explicit chunks but we have text, show the text as a result
        setResults([{
          title: "Neural Summary",
          summary: text,
          isSummary: true
        }]);
      }
    } catch (err: any) {
      console.error("Search failed:", err);
      setError(err.message || "Neural link failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const identityNodes = [
    {
      title: "NeuralBlitz Scriptorium",
      source: "Doc App",
      summary: "Access the unified metalevel technical reference compendium and Absolute Codex vΩZ.5.",
      action: onNavigateToScriptorium,
      icon: <Library className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      tag: "Documentation"
    },
    {
      title: "NeuralBlitz GitHub",
      source: "GitHub",
      summary: "Explore the core repositories, architectural patterns, and open-source contributions of NeuralBlitz.",
      url: "https://github.com/NeuralBlitz/NeuralBlitz",
      icon: <Github className="w-6 h-6 text-neutral-800 dark:text-white" />,
      tag: "Source Code"
    },
    {
      title: "NuralNexus AI",
      source: "NuralNexus",
      summary: "Access state-of-the-art weights, datasets, and community models on our neural hub.",
      url: "https://huggingface.co/NuralNexus",
      icon: <Cpu className="w-6 h-6 text-yellow-500" />,
      tag: "AI Models"
    }
  ];

  const ecosystemNodes = [
    {
      title: "Weights & Biases",
      summary: "The AI developer platform for experiment tracking and model management.",
      url: "https://wandb.ai/",
      icon: <Workflow className="w-6 h-6 text-blue-500" />,
      tag: "MLOps"
    },
    {
      title: "Hugging Face",
      summary: "The collaborative platform for state-of-the-arch machine learning.",
      url: "https://huggingface.co/",
      icon: <Network className="w-6 h-6 text-orange-400" />,
      tag: "Open Source"
    },
    {
      title: "LangChain",
      summary: "Framework for developing applications powered by large language models.",
      url: "https://www.langchain.com/",
      icon: <Layers className="w-6 h-6 text-green-500" />,
      tag: "Framework"
    },
    {
      title: "Pinecone",
      summary: "Vector database for high-performance AI applications.",
      url: "https://www.pinecone.io/",
      icon: <Database className="w-6 h-6 text-blue-400" />,
      tag: "Vector DB"
    },
    {
      title: "Together AI",
      summary: "Fastest cloud platform for building and running generative AI.",
      url: "https://www.together.ai/",
      icon: <Zap className="w-6 h-6 text-indigo-500" />,
      tag: "Compute"
    },
    {
      title: "Replicate",
      summary: "Run machine learning models with a cloud API.",
      url: "https://replicate.com/",
      icon: <Terminal className="w-6 h-6 text-neutral-800 dark:text-neutral-200" />,
      tag: "Inference"
    }
  ];

  return (
    <div className="pt-4 pb-24 px-4 min-h-full transition-colors animate-fade-in">
      <form onSubmit={handleSearch} className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Query the global neural network..." 
          className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-12 text-neutral-800 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-all shadow-sm focus:shadow-blue-500/10 font-medium"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        )}
      </form>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-1 h-4 bg-cyan-600 rounded-full" />
            <h2 className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.25em]">
              Neural Search Results
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {results.map((res, idx) => (
              <div key={idx} className="p-6 rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-black text-lg text-neutral-900 dark:text-white">
                    {res.title}
                  </h3>
                  {res.url && (
                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all">
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                  {res.summary}
                </p>
                {res.url && (
                  <div className="mt-4 text-[10px] font-mono text-neutral-400 truncate">
                    {res.url}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-1 h-4 bg-blue-600 rounded-full" />
          <h2 className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.25em]">
            Identity Nodes
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {identityNodes.map((node, idx) => {
            const Component = node.action ? 'button' : 'a';
            const props = node.action 
              ? { onClick: node.action, className: "text-left" } 
              : { href: (node as any).url, target: "_blank", rel: "noopener noreferrer" };

            return (
              <Component 
                key={idx} 
                {...props}
                className={`group flex flex-col p-6 rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500/40 hover:scale-[1.02] transition-all shadow-xl active:scale-95 ${node.action ? 'w-full' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 group-hover:bg-blue-500/10 transition-colors shadow-inner">
                    {node.icon}
                  </div>
                  <div className="px-3 py-1 bg-blue-500/10 rounded-full">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{node.tag}</span>
                  </div>
                </div>
                <h3 className="font-black text-lg text-neutral-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                  {node.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                  {node.summary}
                </p>
                <div className="mt-6 flex items-center justify-between">
                   <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{node.source}</span>
                   <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Component>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-1 h-4 bg-purple-600 rounded-full" />
          <h2 className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.25em]">
            Intelligence Ecosystem
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ecosystemNodes.map((node, idx) => (
            <a 
              key={idx} 
              href={node.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col p-5 rounded-[2.2rem] bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:border-purple-500/40 hover:bg-white dark:hover:bg-neutral-900 transition-all shadow-sm active:scale-95"
            >
              <div className="mb-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shadow-sm group-hover:scale-110 transition-transform">
                  {node.icon}
                </div>
              </div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1 group-hover:text-purple-600 transition-colors truncate">
                {node.title}
              </h3>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-snug">
                {node.summary}
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
                 <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{node.tag}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchView;
