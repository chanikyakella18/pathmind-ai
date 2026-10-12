import React, { useState } from 'react';
import { Roadmap, RoadmapProject } from '../types/roadmap';
import { Code2, CheckCircle2, Check, ArrowRight, Filter, Layers, Award } from 'lucide-react';

interface ProjectsViewProps {
  roadmap: Roadmap;
  onOpenProjectModal: (project: RoadmapProject) => void;
  onToggleProjectComplete: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  roadmap,
  onOpenProjectModal,
  onToggleProjectComplete,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const allProjects = roadmap.phases.flatMap((phase) =>
    (phase.projects || []).map((proj) => ({ ...proj, phaseTitle: phase.title, phaseNumber: phase.phaseNumber }))
  );

  const filtered = allProjects.filter((p) => {
    if (filterDifficulty !== 'all' && p.difficulty.toLowerCase() !== filterDifficulty.toLowerCase()) {
      return false;
    }
    return true;
  });

  const completedCount = allProjects.filter((p) => p.isCompleted).length;

  return (
    <div className="py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            Milestone Practice Projects Showcase
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build real-world portfolio artifacts that prove your competency to technical interviewers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Difficulty:</span>
          {['all', 'beginner', 'intermediate', 'advanced', 'capstone'].map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition cursor-pointer ${
                filterDifficulty === diff
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((proj) => (
          <div
            key={proj.id}
            className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
              proj.isCompleted
                ? 'bg-slate-900/60 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    Phase {proj.phaseNumber} • {proj.difficulty}
                  </span>
                  {proj.isCompleted && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Built
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onToggleProjectComplete(proj.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    proj.isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                  }`}
                  title="Toggle completed"
                >
                  {proj.isCompleted ? 'Completed' : 'Mark Done'}
                </button>
              </div>

              <h3 className="text-base font-bold text-white hover:text-emerald-300 transition cursor-pointer" onClick={() => onOpenProjectModal(proj)}>
                {proj.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {proj.description}
              </p>

              {/* Skills Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {proj.skillsLearned?.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-indigo-300 border border-slate-700/60 font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Milestones preview */}
              {proj.keyMilestones && proj.keyMilestones.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Milestone Steps:</span>
                  {proj.keyMilestones.slice(0, 2).map((m, mIdx) => (
                    <div key={mIdx} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span className="line-clamp-1">{m}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 italic line-clamp-1 max-w-[280px]">
                {proj.portfolioValue}
              </span>

              <button
                onClick={() => onOpenProjectModal(proj)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>View Blueprint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
