import React, { useState } from 'react';
import { Roadmap } from '../types/roadmap';
import { Compass, Sparkles, Plus, BookOpen, Download, Share2, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  roadmaps: Roadmap[];
  activeRoadmapId: string;
  onSelectRoadmap: (id: string) => void;
  onOpenCreateModal: () => void;
  onExportRoadmap: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roadmaps,
  activeRoadmapId,
  onSelectRoadmap,
  onOpenCreateModal,
  onExportRoadmap,
}) => {
  const [copied, setCopied] = useState(false);
  const activeRoadmap = roadmaps.find((r) => r.id === activeRoadmapId) || roadmaps[0];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4 flex-nowrap">
          {/* Logo & Brand (One-line compact) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent whitespace-nowrap">
                PathMind AI
              </span>
              <span className="hidden md:inline-flex text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                Adaptive
              </span>
            </div>
          </div>

          {/* Roadmap Switcher Tabs (One-line horizontal strip) */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar flex-1 max-w-xl mx-2 sm:mx-4 flex-nowrap">
            {roadmaps.map((rm) => {
              const isActive = rm.id === activeRoadmapId;
              const completedCount = rm.phases.reduce(
                (sum, p) => sum + p.topics.filter((t) => t.isCompleted).length,
                0
              );
              const totalCount = rm.phases.reduce((sum, p) => sum + p.topics.length, 0);
              const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <button
                  key={rm.id}
                  onClick={() => onSelectRoadmap(rm.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={rm.title}
                >
                  <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="max-w-[110px] sm:max-w-[140px] truncate">{rm.title}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full shrink-0 ${
                      isActive ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {percent}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons (One-line right side) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Generate</span>
              <span>New</span>
            </button>

            <button
              onClick={onExportRoadmap}
              title="Export Roadmap (Markdown)"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              title="Share Link"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs transition cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
