import React, { useState } from 'react';
import { Roadmap } from '../types/roadmap';
import { Calendar, Clock, TrendingUp, CheckCircle, Award, Target, Flame, ChevronRight } from 'lucide-react';

interface StudyPlannerViewProps {
  roadmap: Roadmap;
  onUpdatePace?: (hoursPerDay: number, daysPerWeek: number) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  roadmap,
}) => {
  const [simHours, setSimHours] = useState(roadmap.userProfile.hoursPerDay || 1);
  const [simDays, setSimDays] = useState(roadmap.userProfile.daysPerWeek || 7);

  const allTopics = roadmap.phases.flatMap((p) => p.topics);
  const completedTopics = allTopics.filter((t) => t.isCompleted);
  const completedHours = completedTopics.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const totalHours = roadmap.totalEstimatedHours || allTopics.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const remainingHours = Math.max(0, totalHours - completedHours);

  // Original timeline
  const currentWeeklyHours = (roadmap.userProfile.hoursPerDay || 1) * (roadmap.userProfile.daysPerWeek || 7);
  const currentRemainingWeeks = currentWeeklyHours > 0 ? Math.ceil(remainingHours / currentWeeklyHours) : 20;

  // Simulated timeline
  const simWeeklyHours = simHours * simDays;
  const simRemainingWeeks = simWeeklyHours > 0 ? Math.ceil(remainingHours / simWeeklyHours) : 20;
  const weeksSaved = currentRemainingWeeks - simRemainingWeeks;

  const simProjectedDate = new Date();
  simProjectedDate.setDate(simProjectedDate.getDate() + simRemainingWeeks * 7);

  let cumulativeWeeks = 0;

  return (
    <div className="py-8 space-y-8">
      {/* Pace Simulator Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Dynamic Study Pace & Completion Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Adjust your daily commitment slider to see how accelerating your study schedule affects your completion milestone.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Simulated Target Date
            </span>
            <div className="text-base sm:text-lg font-black text-indigo-300 font-mono">
              {simProjectedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold">Daily Study Time:</span>
              <span className="font-mono text-cyan-400 font-bold">
                {simHours} {simHours === 1 ? 'hour' : 'hours'} / day
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={simHours}
              onChange={(e) => setSimHours(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5h</span>
              <span>1h</span>
              <span>2h</span>
              <span>4h</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold">Days per Week:</span>
              <span className="font-mono text-indigo-400 font-bold">
                {simDays} days / week
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="7"
              step="1"
              value={simDays}
              onChange={(e) => setSimDays(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>3 days</span>
              <span>5 days</span>
              <span>7 days</span>
            </div>
          </div>
        </div>

        {/* Impact callout */}
        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <span>
            At <strong>{simHours * simDays} hrs/week</strong>, you will finish all {totalHours} curriculum hours in approx{' '}
            <strong className="text-white">{simRemainingWeeks} weeks</strong>.
          </span>
          {weeksSaved > 0 && (
            <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
              <Flame className="w-3.5 h-3.5" />
              Saves {weeksSaved} weeks!
            </span>
          )}
        </div>
      </div>

      {/* Phase Milestone Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-cyan-400" />
          Staged Milestone Schedule
        </h3>

        <div className="space-y-3">
          {roadmap.phases.map((phase, pIdx) => {
            const phaseWeeks = phase.estimatedWeeks || 4;
            const startWeek = cumulativeWeeks;
            cumulativeWeeks += phaseWeeks;
            const endWeek = cumulativeWeeks;

            const completedInPhase = phase.topics.filter((t) => t.isCompleted).length;
            const isPhaseDone = completedInPhase === phase.topics.length && phase.topics.length > 0;

            const phaseStartDate = new Date();
            phaseStartDate.setDate(phaseStartDate.getDate() + startWeek * 7);

            const phaseEndDate = new Date();
            phaseEndDate.setDate(phaseEndDate.getDate() + endWeek * 7);

            return (
              <div
                key={phase.id}
                className="bg-slate-900/80 rounded-xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      Phase {pIdx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {phase.title}
                    </h4>
                    {isPhaseDone && (
                      <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        Achieved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {phase.focus}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-300 shrink-0">
                  <div className="text-right">
                    <div className="text-slate-400 text-[10px]">ESTIMATED DURATION</div>
                    <div className="font-bold text-white">
                      {phase.estimatedTotalHours} hrs (~{phaseWeeks} wks)
                    </div>
                  </div>

                  <div className="w-px h-8 bg-slate-800 hidden sm:block" />

                  <div className="text-right">
                    <div className="text-slate-400 text-[10px]">PROJECTED WINDOW</div>
                    <div className="text-slate-300">
                      {phaseStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                      {phaseEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
