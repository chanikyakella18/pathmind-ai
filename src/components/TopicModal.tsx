import React from 'react';
import { RoadmapTopic, RoadmapPhase } from '../types/roadmap';
import {
  X,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Brain,
  Check,
  Sparkles,
  FileText,
  Target,
} from 'lucide-react';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: RoadmapTopic | null;
  phase: RoadmapPhase | null;
  onToggleComplete: () => void;
  onLaunchQuiz: () => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  onClose,
  topic,
  phase,
  onToggleComplete,
  onLaunchQuiz,
}) => {
  if (!isOpen || !topic || !phase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/95 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Phase {phase.phaseNumber}: {phase.title}
              </span>
              {topic.isRemedialAdded && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Injected Remedial Topic
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {topic.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1 font-mono text-cyan-400">
                <Clock className="w-3.5 h-3.5" />
                ~{topic.estimatedHours} Hours Required
              </span>
              <span>•</span>
              <span className={topic.isCompleted ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                {topic.isCompleted ? 'Status: Completed' : 'Status: In Progress'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              Module Overview
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {topic.description}
            </p>
          </div>

          {/* Key Learning Outcomes */}
          {topic.keyOutcomes && topic.keyOutcomes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                Measurable Learning Outcomes
              </h4>
              <div className="space-y-2">
                {topic.keyOutcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-850/60 border border-slate-800 text-xs sm:text-sm text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curated Resources */}
          {topic.resources && topic.resources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Curated High-Yield Resources
              </h4>
              <div className="space-y-2">
                {topic.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.urlOrSearch}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3.5 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">
                          {res.title}
                        </span>
                        {res.free && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                            Free
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                          {res.type}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition shrink-0" />
                    </div>
                    {res.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {res.description}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onToggleComplete}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition flex items-center gap-2 cursor-pointer ${
              topic.isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {topic.isCompleted ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Marked as Completed</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Completed</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              onLaunchQuiz();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Launch Topic Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
