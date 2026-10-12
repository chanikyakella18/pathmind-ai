import React, { useState } from 'react';
import { RoadmapProject } from '../types/roadmap';
import { requestProjectGuide } from '../services/api';
import {
  X,
  Code2,
  CheckCircle2,
  Sparkles,
  Layers,
  Terminal,
  ExternalLink,
  Award,
  Check,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: RoadmapProject | null;
  targetCareer: string;
  onToggleProjectComplete: (projectId: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  targetCareer,
  onToggleProjectComplete,
}) => {
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideData, setGuideData] = useState<any | null>(null);

  if (!isOpen || !project) return null;

  const handleGenerateBlueprint = async () => {
    setGuideLoading(true);
    try {
      const data = await requestProjectGuide(
        project.title,
        project.skillsLearned || [],
        targetCareer
      );
      setGuideData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setGuideLoading(false);
    }
  };

  const handleToggle = () => {
    onToggleProjectComplete(project.id);
    if (!project.isCompleted) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/95 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {project.difficulty} Practice Project
              </span>
              {project.isCompleted && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Built
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {project.title}
            </h3>
            <p className="text-xs text-slate-400">
              {project.portfolioValue}
            </p>
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
          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Project Specification
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          {project.skillsLearned && project.skillsLearned.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Required Tech Stack & Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.skillsLearned.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-800 text-indigo-300 border border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Milestones */}
          {project.keyMilestones && project.keyMilestones.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Step-by-Step Implementation Milestones
              </h4>
              <div className="space-y-2">
                {project.keyMilestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-xs sm:text-sm text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{milestone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {project.deliverables && project.deliverables.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Portfolio Deliverables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.deliverables.map((deliv, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{deliv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI In-Depth Blueprint Section */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  AI Architecture Blueprint & Execution Guide
                </h4>
              </div>

              {!guideData && (
                <button
                  onClick={handleGenerateBlueprint}
                  disabled={guideLoading}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {guideLoading ? 'Formulating...' : 'Generate AI Blueprint'}
                </button>
              )}
            </div>

            {guideLoading && (
              <div className="py-6 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">
                  Architecting project blueprints, APIs, and interview talking points...
                </p>
              </div>
            )}

            {guideData && (
              <div className="space-y-3 pt-2 text-xs text-slate-300">
                <div>
                  <span className="font-semibold text-slate-400">Architecture: </span>
                  <span>{guideData.architecture}</span>
                </div>

                {guideData.datasetsAndTools?.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-400">Recommended Tools & Datasets:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {guideData.datasetsAndTools.map((tool: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {guideData.interviewHighlights?.length > 0 && (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg space-y-1">
                    <span className="font-bold text-indigo-300">Interview Talking Points:</span>
                    {guideData.interviewHighlights.map((pt: string, pIdx: number) => (
                      <p key={pIdx} className="text-slate-300 pl-2">
                        • {pt}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleToggle}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition flex items-center gap-2 cursor-pointer ${
              project.isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
            }`}
          >
            {project.isCompleted ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Marked as Built</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Project as Built</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
