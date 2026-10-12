import React from 'react';
import { Roadmap, RoadmapPhase } from '../types/roadmap';
import { Brain, Award, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Clock } from 'lucide-react';

interface QuizzesViewProps {
  roadmap: Roadmap;
  onLaunchQuiz: (topicTitle: string, phase: RoadmapPhase) => void;
}

export const QuizzesView: React.FC<QuizzesViewProps> = ({
  roadmap,
  onLaunchQuiz,
}) => {
  const quizHistory = roadmap.quizHistory || [];
  const averageScore =
    quizHistory.length > 0
      ? Math.round(quizHistory.reduce((a, b) => a + b.score, 0) / quizHistory.length)
      : null;

  return (
    <div className="py-8 space-y-8">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                AI Knowledge Diagnostics & Adaptive Testing Hub
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Quizzes are not just tests; they drive the <strong>Adaptive Learning Engine</strong>. Scoring below 75% automatically injects remedial micro-modules and adjustments into your roadmap. Scoring high unlocks advanced challenges!
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800 shrink-0">
            <div className="text-center">
              <div className="text-xl font-black text-white font-mono">
                {averageScore !== null ? `${averageScore}%` : 'N/A'}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Average Mastery
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center">
              <div className="text-xl font-black text-white font-mono">
                {quizHistory.length}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Tests Taken
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Diagnostics by Phase */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Available Competency Diagnostic Tests (Grouped by Phase)
        </h3>

        <div className="space-y-4">
          {roadmap.phases.map((phase) => (
            <div
              key={phase.id}
              className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    Phase {phase.phaseNumber}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {phase.title}
                  </h4>
                </div>
                <span className="text-xs text-slate-400">
                  {phase.topics.length} topics covered
                </span>
              </div>

              {/* Quiz buttons grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {/* Topics Quizzes */}
                {phase.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => onLaunchQuiz(topic.title, phase)}
                    className="p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-indigo-500/40 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition truncate">
                        {topic.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {topic.quizScore ? `Last score: ${topic.quizScore}%` : 'Not tested yet'}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition shrink-0" />
                  </button>
                ))}

                {/* Additional competency topics */}
                {phase.quizTopics?.map((qt, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => onLaunchQuiz(qt, phase)}
                    className="p-3 rounded-lg bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-500/20 hover:border-indigo-500/40 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-indigo-200 group-hover:text-white transition truncate">
                        {qt}
                      </div>
                      <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                        Comprehensive Drill
                      </div>
                    </div>
                    <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Quiz History Log */}
      {quizHistory.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            Completed Quiz Performance Log
          </h3>

          <div className="space-y-3">
            {quizHistory.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        item.score >= 75
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.score}%
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {item.topicTitle}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                    <span>
                      {item.correctCount} / {item.totalQuestions} questions correct
                    </span>
                    <span>•</span>
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>

                  {item.weakConcepts?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Reinforcement needed in: {item.weakConcepts.join(', ')}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    const phase = roadmap.phases.find((p) => p.id === item.phaseId) || roadmap.phases[0];
                    onLaunchQuiz(item.topicTitle, phase);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retest</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
