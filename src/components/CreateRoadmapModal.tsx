import React, { useState } from 'react';
import { UserProfile, SkillItem } from '../types/roadmap';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  Calendar,
  GraduationCap,
  TrendingUp,
  Brain,
  Code2,
  Check,
} from 'lucide-react';

interface CreateRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profile: UserProfile) => Promise<void>;
}

export const CreateRoadmapModal: React.FC<CreateRoadmapModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [targetCareer, setTargetCareer] = useState('');
  const [skills, setSkills] = useState<SkillItem[]>([
    { name: 'Python', level: 'Beginner' },
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced'>('Beginner');
  const [hoursPerDay, setHoursPerDay] = useState(1);
  const [daysPerWeek, setDaysPerWeek] = useState(7);
  const [learningPace, setLearningPace] = useState<'Relaxed' | 'Balanced' | 'Intensive'>('Balanced');
  const [learningStyle, setLearningStyle] = useState<'Projects & Hands-on' | 'Theory & Deep-Dive' | 'Balanced Hybrid'>('Balanced Hybrid');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const applyPreset = (preset: {
    career: string;
    skills: SkillItem[];
    hours: number;
    days: number;
    notes: string;
  }) => {
    setTargetCareer(preset.career);
    setSkills(preset.skills);
    setHoursPerDay(preset.hours);
    setDaysPerWeek(preset.days);
    setAdditionalNotes(preset.notes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCareer.trim()) return;

    setIsGenerating(true);
    try {
      await onSubmit({
        currentSkills: skills,
        targetCareer: targetCareer.trim(),
        hoursPerDay,
        daysPerWeek,
        learningPace,
        learningStyle,
        additionalNotes,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                AI Learning Roadmap Generator
              </h3>
              <p className="text-xs text-slate-400">
                Personalized study plan calibrated to your skills and daily time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quick Starters & Examples:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    career: 'AI Engineer',
                    skills: [
                      { name: 'Basic Python', level: 'Beginner' },
                      { name: 'High School Math', level: 'Intermediate' },
                    ],
                    hours: 1,
                    days: 7,
                    notes: 'Aiming to build and deploy ML, PyTorch, and LLM applications.',
                  })
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 transition text-left"
              >
                ⚡ Python → AI Engineer (1 hr/day)
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    career: 'Full-Stack AI Developer',
                    skills: [
                      { name: 'JavaScript & HTML', level: 'Intermediate' },
                      { name: 'Basic React', level: 'Beginner' },
                    ],
                    hours: 1.5,
                    days: 6,
                    notes: 'Focus on full-stack web development with vector search and AI agent tools.',
                  })
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 border border-violet-500/30 transition text-left"
              >
                ⚡ Web Dev → Full-Stack AI (1.5 hr/day)
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    career: 'Applied Machine Learning Specialist',
                    skills: [
                      { name: 'Excel / Spreadsheets', level: 'Intermediate' },
                      { name: 'Basic SQL', level: 'Beginner' },
                    ],
                    hours: 1,
                    days: 5,
                    notes: 'Prioritize statistical foundations, predictive models, and A/B testing.',
                  })
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 transition text-left"
              >
                ⚡ SQL/Data → ML Specialist (1 hr/day)
              </button>
            </div>
          </div>

          {/* Target Career */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              Target Career or Role <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              placeholder="e.g. AI Engineer, Full-Stack Developer, MLOps Specialist"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 transition"
            />
          </div>

          {/* Current Skills Collection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-400" />
              Current Skills & Proficiencies
            </label>

            <div className="flex flex-wrap gap-2 min-h-[40px] p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-500 italic p-1">
                  No skills listed yet. Add what you currently know below.
                </span>
              ) : (
                skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    <span>{skill.name}</span>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      ({skill.level})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-slate-400 hover:text-rose-400 transition ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add skill input row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Add skill (e.g. Basic Python, Git, Calculus)"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />

              <select
                value={newSkillLevel}
                onChange={(e: any) => setNewSkillLevel(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
              >
                <option value="Beginner">Beginner</option>
                <option value="Elementary">Elementary</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Time & Commitment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Available Study Time:
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {hoursPerDay} {hoursPerDay === 1 ? 'hour' : 'hours'} / day
                </span>
              </label>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>30 mins</span>
                <span>1 hr</span>
                <span>2 hrs</span>
                <span>4 hrs</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Days per Week:
                </span>
                <span className="font-mono text-indigo-400 font-bold">
                  {daysPerWeek} days / wk
                </span>
              </label>
              <input
                type="range"
                min="3"
                max="7"
                step="1"
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>3 days</span>
                <span>5 days</span>
                <span>7 days (Daily)</span>
              </div>
            </div>
          </div>

          {/* Pace & Learning Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Learning Pace
              </label>
              <select
                value={learningPace}
                onChange={(e: any) => setLearningPace(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="Relaxed">Relaxed (Low stress, ample practice)</option>
                <option value="Balanced">Balanced (Standard industry pace)</option>
                <option value="Intensive">Intensive (Fast-track immersion)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-violet-400" />
                Learning Style Preference
              </label>
              <select
                value={learningStyle}
                onChange={(e: any) => setLearningStyle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="Balanced Hybrid">Balanced Hybrid (Theory + Projects)</option>
                <option value="Projects & Hands-on">Projects & Hands-on (Code-first)</option>
                <option value="Theory & Deep-Dive">Theory & Deep-Dive (First principles)</option>
              </select>
            </div>
          </div>

          {/* Additional Context */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Additional Goals or Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Preparing for technical interviews in 6 months, building a startup MVP, etc."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          {/* Calculation summary pill */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Weekly Study Commitment:</span>
            <span className="font-mono font-bold text-indigo-400">
              ~{hoursPerDay * daysPerWeek} hours / week
            </span>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating || !targetCareer.trim()}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Curriculum with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Personalized Roadmap</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
