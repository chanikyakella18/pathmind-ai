import React from 'react';
import { Roadmap, RoadmapPhase } from '../types/roadmap';
import {
  Sparkles,
  Brain,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';

interface AdaptiveLogViewProps {
  roadmap: Roadmap;
  onLaunchQuiz: (topicTitle: string, phase: RoadmapPhase) => void;
}

export const AdaptiveLogView: React.FC<AdaptiveLogViewProps> = ({
  roadmap,
  onLaunchQuiz,
}) => {
  const adaptations = roadmap.adaptations || [];
  const remedialTopicsCount = roadmap.phases.reduce(
    (sum, p) => sum + p.topics.filter((t) => t.isRemedialAdded).length,
    0
  );

  return (
    <div className="py-8 space-y-8">
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-6 rounded-2xl border border-amber-500/20 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Measurable Adaptation Engine & Mentorship Audit
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Unlike static syllabi, PathMind AI actively reshapes your learning trajectory. When quiz diagnostics expose knowledge blind spots, our AI automatically generates bite-sized remediation drills and recalibrates projected milestones.
        </p>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
            <strong>{adaptations.length}</strong> Adaptation Events Logged
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono">
            <strong>{remedialTopicsCount}</strong> Reinforcement Modules Injected
          </span>
        </div>
      </div>

      {/* Adaptation Timeline */}
      {adaptations.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Brain className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">
            No adaptations triggered yet
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Take a diagnostic quiz on any topic to see the AI dynamically recalibrate your roadmap and recommend tailored practice!
          </p>
          <button
            onClick={() => {
              const firstPhase = roadmap.phases[0];
              if (firstPhase && firstPhase.topics[0]) {
                onLaunchQuiz(firstPhase.topics[0].title, firstPhase);
              }
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
          >
            Take First Diagnostic Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Chronological Adaptation Event History
          </h3>

          <div className="space-y-4">
            {adaptations.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4 relative overflow-hidden"
              >
                {/* Status bar glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-indigo-500" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-md ${
                        item.score >= 75
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      Quiz Score: {item.score}%
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {item.triggerReason}
                    </h4>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Mentor Note */}
                {item.encouragement && (
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 italic flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      "{item.encouragement}"
                    </p>
                  </div>
                )}

                {/* Gaps & Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Identified Gaps */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Identified Knowledge Gaps:
                    </span>
                    <div className="space-y-1">
                      {item.identifiedGaps?.length > 0 ? (
                        item.identifiedGaps.map((gap, gIdx) => (
                          <div
                            key={gIdx}
                            className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{gap}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">None detected</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Taken */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Curriculum Adaptations Executed:
                    </span>
                    <div className="space-y-1">
                      {item.actionsTaken?.map((action, aIdx) => (
                        <div
                          key={aIdx}
                          className="p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Injected topics list */}
                {item.newTopicsAdded && item.newTopicsAdded.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Injected Remedial Modules:
                    </span>
                    {item.newTopicsAdded.map((topicName, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-medium"
                      >
                        {topicName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
