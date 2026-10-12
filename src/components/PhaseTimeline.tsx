import React from 'react';
import { Roadmap, RoadmapPhase, RoadmapTopic, RoadmapProject } from '../types/roadmap';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  HelpCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Code2,
  Check,
  Brain,
  AlertCircle,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PhaseTimelineProps {
  roadmap: Roadmap;
  onToggleTopic: (phaseId: string, topicId: string) => void;
  onOpenTopicModal: (topic: RoadmapTopic, phase: RoadmapPhase) => void;
  onOpenQuizModal: (topicTitle: string, phase: RoadmapPhase) => void;
  onOpenProjectModal: (project: RoadmapProject) => void;
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({
  roadmap,
  onToggleTopic,
  onOpenTopicModal,
  onOpenQuizModal,
  onOpenProjectModal,
}) => {
  const handleToggle = (phaseId: string, topic: RoadmapTopic, phase: RoadmapPhase) => {
    onToggleTopic(phaseId, topic.id);
    if (!topic.isCompleted) {
      // Check if this was the last uncompleted topic in the phase
      const otherUncompleted = phase.topics.filter(
        (t) => t.id !== topic.id && !t.isCompleted
      );
      if (otherUncompleted.length === 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  return (
    <div className="py-8 space-y-10">
      {roadmap.phases.map((phase, pIdx) => {
        const completedTopics = phase.topics.filter((t) => t.isCompleted);
        const phasePercent =
          phase.topics.length > 0
            ? Math.round((completedTopics.length / phase.topics.length) * 100)
            : 0;
        const isPhaseComplete = phasePercent === 100;

        return (
          <div
            key={phase.id}
            className={`relative bg-slate-900/90 rounded-2xl border transition-all ${
              isPhaseComplete
                ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                : 'border-slate-800 shadow-xl'
            } overflow-hidden`}
          >
            {/* Phase Header Banner */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-sm border border-indigo-500/30 font-mono">
                      {pIdx + 1}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {phase.title}
                    </h2>
                    {isPhaseComplete && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-indigo-300">
                    {phase.tagline}
                  </p>
                  <p className="text-xs text-slate-400 max-w-3xl leading-relaxed pt-1">
                    {phase.focus}
                  </p>
                </div>

                {/* Phase Meta & Progress */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      ~{phase.estimatedTotalHours} hrs
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-300">
                      {phase.estimatedWeeks} wks
                    </span>
                  </div>

                  <div className="w-36 sm:w-44 text-right">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Phase Progress</span>
                      <span className="font-bold text-slate-200">{phasePercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPhaseComplete
                            ? 'bg-emerald-400'
                            : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                        }`}
                        style={{ width: `${phasePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz Topics Tags */}
              {phase.quizTopics && phase.quizTopics.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Brain className="w-3 h-3 text-violet-400" />
                    Key Competencies:
                  </span>
                  {phase.quizTopics.map((qt, idx) => (
                    <button
                      key={idx}
                      onClick={() => onOpenQuizModal(qt, phase)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 hover:text-indigo-300 hover:bg-slate-800 border border-slate-700/60 transition flex items-center gap-1 cursor-pointer"
                      title="Take diagnostic quiz on this competency"
                    >
                      {qt}
                      <Brain className="w-2.5 h-2.5 text-indigo-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Topics Section */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Core Curriculum Topics ({completedTopics.length}/{phase.topics.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Click checkbox to track mastery
                </span>
              </div>

              <div className="space-y-3">
                {phase.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`group rounded-xl p-4 border transition-all ${
                      topic.isCompleted
                        ? 'bg-slate-900/40 border-slate-800 opacity-90'
                        : topic.isRemedialAdded
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-500/5'
                        : 'bg-slate-850/60 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggle(phase.id, topic, phase)}
                        className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                        title={topic.isCompleted ? 'Mark as incomplete' : 'Mark topic completed'}
                      >
                        {topic.isCompleted ? (
                          <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded border border-slate-600 hover:border-indigo-400 bg-slate-800 flex items-center justify-center" />
                        )}
                      </button>

                      {/* Topic Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4
                              onClick={() => onOpenTopicModal(topic, phase)}
                              className={`text-sm sm:text-base font-bold cursor-pointer transition ${
                                topic.isCompleted
                                  ? 'text-slate-300 line-through decoration-slate-600'
                                  : 'text-white hover:text-indigo-300'
                              }`}
                            >
                              {topic.title}
                            </h4>

                            {topic.isRemedialAdded && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Sparkles className="w-2.5 h-2.5" />
                                AI Adapted Reinforcement
                              </span>
                            )}

                            {topic.quizScore && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                                Quiz: {topic.quizScore}%
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              {topic.estimatedHours}h
                            </span>

                            <button
                              onClick={() => onOpenQuizModal(topic.title, phase)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 transition flex items-center gap-1.5 cursor-pointer"
                              title="Generate an AI Quiz for this topic"
                            >
                              <Brain className="w-3 h-3 text-indigo-400" />
                              <span>Quiz</span>
                            </button>

                            <button
                              onClick={() => onOpenTopicModal(topic, phase)}
                              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition"
                              title="View details & learning outcomes"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                          {topic.description}
                        </p>

                        {/* Outcomes Preview */}
                        {topic.keyOutcomes && topic.keyOutcomes.length > 0 && (
                          <div className="mt-2.5 space-y-1">
                            {topic.keyOutcomes.slice(0, 2).map((outcome, oIdx) => (
                              <div
                                key={oIdx}
                                className="flex items-start gap-1.5 text-xs text-slate-300"
                              >
                                <span className="text-indigo-400 shrink-0 font-bold">•</span>
                                <span className="line-clamp-1">{outcome}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Resources Pills */}
                        {topic.resources && topic.resources.length > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {topic.resources.map((res, rIdx) => (
                              <a
                                key={rIdx}
                                href={res.urlOrSearch}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition"
                              >
                                <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                                <span className="max-w-[200px] truncate">{res.title}</span>
                                {res.free && (
                                  <span className="text-[9px] text-emerald-400 font-bold uppercase">
                                    Free
                                  </span>
                                )}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Practice Projects inside Phase */}
              {phase.projects && phase.projects.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      Milestone Practice Projects
                    </h4>
                    <span className="text-xs text-slate-500">
                      Portfolio builders
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {proj.difficulty} Project
                            </span>
                            {proj.isCompleted && (
                              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Built
                              </span>
                            )}
                          </div>
                          <h5 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                            {proj.title}
                          </h5>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {proj.description}
                          </p>

                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {proj.skillsLearned?.map((sk, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-850 text-slate-400 font-mono"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 italic line-clamp-1">
                            {proj.portfolioValue}
                          </span>
                          <button
                            onClick={() => onOpenProjectModal(proj)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <span>Blueprint</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
