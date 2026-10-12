import React from 'react';
import { Roadmap } from '../types/roadmap';
import {
  Clock,
  Calendar,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  Brain,
  Code2,
} from 'lucide-react';

interface RoadmapHeaderProps {
  roadmap: Roadmap;
  activeTab: 'stages' | 'projects' | 'quizzes' | 'adaptations' | 'planner';
  onTabChange: (tab: 'stages' | 'projects' | 'quizzes' | 'adaptations' | 'planner') => void;
  onOpenTopicModal?: (topic: any) => void;
}

export const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({
  roadmap,
  activeTab,
  onTabChange,
}) => {
  // Calculations
  const allTopics = roadmap.phases.flatMap((p) => p.topics);
  const completedTopics = allTopics.filter((t) => t.isCompleted);
  const totalTopicsCount = allTopics.length;
  const completedTopicsCount = completedTopics.length;
  const progressPercent = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  const completedHours = completedTopics.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalHours = roadmap.totalEstimatedHours || allTopics.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const remainingHours = Math.max(0, totalHours - completedHours);

  const hoursPerDay = roadmap.userProfile.hoursPerDay || 1;
  const daysPerWeek = roadmap.userProfile.daysPerWeek || 7;
  const weeklyHours = hoursPerDay * daysPerWeek;
  const remainingWeeks = weeklyHours > 0 ? Math.ceil(remainingHours / weeklyHours) : 24;

  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + remainingWeeks * 7);
  const formattedProjectedDate = projectedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const quizScores = roadmap.quizHistory?.map((q) => q.score) || [];
  const averageScore = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : null;

  const adaptationsCount = roadmap.adaptations?.length || 0;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white pt-6 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges & Career Track */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              Target: {roadmap.userProfile.targetCareer}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {hoursPerDay} hr/day • {daysPerWeek} days/wk
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              {roadmap.userProfile.learningPace} Pace
            </span>
            {adaptationsCount > 0 && (
              <button
                onClick={() => onTabChange('adaptations')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                {adaptationsCount} AI {adaptationsCount === 1 ? 'Adaptation' : 'Adaptations'} Active
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Projected Completion: <span className="text-slate-200 font-semibold">{formattedProjectedDate}</span>
          </div>
        </div>

        {/* Title & Summary */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {roadmap.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
            {roadmap.summary}
          </p>

          {/* Current Skills Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Baseline Skills:</span>
            {roadmap.userProfile.currentSkills?.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-800/90 text-slate-300 border border-slate-700/80"
              >
                <Code2 className="w-3 h-3 text-indigo-400" />
                {skill.name}
                <span className="text-[10px] text-slate-400 font-mono">({skill.level})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Progress Card */}
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700/60 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Overall Progress</span>
              <span className="text-xs font-bold text-indigo-400">{progressPercent}%</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {completedTopicsCount} <span className="text-xs font-normal text-slate-400">/ {totalTopicsCount} topics</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700/80 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Hours Card */}
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Study Hours</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {completedHours} <span className="text-xs font-normal text-slate-400">/ {totalHours} hrs</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 truncate">
              ~{remainingHours} hrs remaining
            </p>
          </div>

          {/* Quiz Performance Card */}
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Quiz Mastery</span>
              <Award className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {averageScore !== null ? `${averageScore}%` : 'Not tested'}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {quizScores.length} {quizScores.length === 1 ? 'assessment' : 'assessments'} completed
            </p>
          </div>

          {/* Adaptive Engine Card */}
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Adaptive Engine</span>
              <Brain className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {adaptationsCount > 0 ? `${adaptationsCount} Events` : 'Calibrated'}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 truncate">
              {adaptationsCount > 0 ? 'Customized per test scores' : 'Auto-adapts on quizzes'}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('stages')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'stages'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Learning Stages & Topics</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {roadmap.phases.length}
            </span>
          </button>

          <button
            onClick={() => onTabChange('projects')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Practice Projects</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {roadmap.phases.reduce((acc, p) => acc + (p.projects?.length || 0), 0)}
            </span>
          </button>

          <button
            onClick={() => onTabChange('quizzes')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'quizzes'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Quizzes & Tests</span>
            {averageScore !== null && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                Avg: {averageScore}%
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('adaptations')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'adaptations'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Adaptive Log</span>
            {adaptationsCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {adaptationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('planner')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'planner'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Study Planner & Pace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
