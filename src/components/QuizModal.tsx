import React, { useState, useEffect } from 'react';
import { QuizQuestion, RoadmapPhase, AdaptationHistory, RoadmapTopic } from '../types/roadmap';
import { requestGenerateQuiz, requestAdaptRoadmap } from '../services/api';
import {
  X,
  Brain,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Award,
  AlertTriangle,
  Lightbulb,
  Clock,
  Code,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  phase: RoadmapPhase;
  targetCareer: string;
  roadmapId: string;
  onAdaptationApplied: (adaptation: AdaptationHistory, remedialTopics: RoadmapTopic[], score: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  topicTitle,
  phase,
  targetCareer,
  roadmapId,
  onAdaptationApplied,
}) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    conceptTested: string;
  }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [adaptationResult, setAdaptationResult] = useState<{
    adaptationRecord: AdaptationHistory;
    remedialTopics: RoadmapTopic[];
  } | null>(null);

  useEffect(() => {
    if (isOpen && topicTitle) {
      loadQuiz();
    } else {
      resetState();
    }
  }, [isOpen, topicTitle]);

  const resetState = () => {
    setLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setIsFinished(false);
    setAdapting(false);
    setAdaptationResult(null);
  };

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const data = await requestGenerateQuiz(topicTitle, phase.focus, targetCareer);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQ) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctOptionIndex;
    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedOption,
        isCorrect,
        conceptTested: currentQ.conceptTested,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsFinished(true);

    // Calculate score
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    const score = Math.round((correctCount / (questions.length || 1)) * 100);

    if (score >= 75) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    // Auto-trigger adaptive roadmap recommendation
    await triggerAdaptiveAnalysis(score);
  };

  const triggerAdaptiveAnalysis = async (score: number) => {
    setAdapting(true);
    try {
      const weakConcepts = userAnswers
        .filter((a) => !a.isCorrect)
        .map((a) => a.conceptTested);
      const masteredConcepts = userAnswers
        .filter((a) => a.isCorrect)
        .map((a) => a.conceptTested);

      const result = await requestAdaptRoadmap({
        roadmapId,
        phaseId: phase.id,
        topicTitle,
        score,
        totalQuestions: questions.length,
        weakConcepts,
        masteredConcepts,
        answers: userAnswers,
        targetCareer,
      });

      setAdaptationResult(result);
      onAdaptationApplied(result.adaptationRecord, result.remedialTopics, score);
    } catch (e) {
      console.error('Adaptation failed:', e);
    } finally {
      setAdapting(false);
    }
  };

  const correctTotal = userAnswers.filter((a) => a.isCorrect).length;
  const scorePercent = questions.length > 0 ? Math.round((correctTotal / questions.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Diagnostic Quiz
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  Phase {phase.phaseNumber}
                </span>
              </div>
              <h3 className="text-base font-bold text-white max-w-md truncate">
                {topicTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-200">
                Generating contextual technical quiz with Gemini...
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Formulating rigorous scenario questions tailored to {topicTitle} and {targetCareer}.
              </p>
            </div>
          ) : isFinished ? (
            /* Results Screen */
            <div className="space-y-6">
              <div className="text-center py-4 bg-slate-950/60 rounded-xl border border-slate-800 p-6">
                <div
                  className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
                    scorePercent >= 75
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {scorePercent >= 75 ? (
                    <Award className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </div>

                <h4 className="text-2xl font-black text-white">
                  Score: {scorePercent}%
                </h4>
                <p className="text-sm text-slate-300 mt-1">
                  You answered {correctTotal} out of {questions.length} questions correctly.
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {scorePercent >= 75
                    ? 'Superb! Solid conceptual mastery demonstrated.'
                    : 'Good effort! Some knowledge gaps were identified and are being automatically adapted.'}
                </p>
              </div>

              {/* Adaptive Feedback Card */}
              <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <h5 className="text-sm font-bold text-white">
                    Dynamic Roadmap Adaptation Engine
                  </h5>
                  {adapting && (
                    <span className="text-[10px] text-indigo-400 font-mono animate-pulse">
                      Analyzing cognitive gaps...
                    </span>
                  )}
                </div>

                {adaptationResult ? (
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-300 italic border-l-2 border-indigo-500 pl-3 leading-relaxed">
                      "{adaptationResult.adaptationRecord.encouragement}"
                    </p>

                    {adaptationResult.adaptationRecord.identifiedGaps?.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                          Targeted Growth Areas:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {adaptationResult.adaptationRecord.identifiedGaps.map((gap, gIdx) => (
                            <span
                              key={gIdx}
                              className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[11px]"
                            >
                              {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {adaptationResult.remedialTopics?.length > 0 && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-1">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          {adaptationResult.remedialTopics.length} Remedial Reinforcement Topic(s) Injected Into Phase {phase.phaseNumber}:
                        </span>
                        {adaptationResult.remedialTopics.map((rt, rtIdx) => (
                          <div key={rtIdx} className="text-slate-200 pl-5">
                            • <span className="font-semibold">{rt.title}</span> (~{rt.estimatedHours} hrs)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Adapting future topics to reinforce missed concepts...
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={resetState}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue Learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : currentQ ? (
            /* Active Question Screen */
            <div className="space-y-5">
              {/* Progress & Concept Pill */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono border border-slate-700">
                  Concept: {currentQ.conceptTested}
                </span>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                <h4 className="text-base font-bold text-white leading-snug">
                  {currentQ.question}
                </h4>

                {currentQ.codeSnippet && (
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto">
                    <pre>{currentQ.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedOption === oIdx;
                  const isCorrect = oIdx === currentQ.correctOptionIndex;

                  let optionStyle = 'bg-slate-850/80 hover:bg-slate-800 border-slate-800 text-slate-200';
                  if (isSelected && !isAnswerSubmitted) {
                    optionStyle = 'bg-indigo-600/20 border-indigo-500 text-indigo-100 shadow-sm';
                  } else if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition flex items-start gap-3 cursor-pointer ${optionStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current/40 shrink-0 flex items-center justify-center text-xs font-mono font-bold">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown after submit) */}
              {isAnswerSubmitted && (
                <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Technical Explanation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Navigation Action */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className={`px-5 py-2 text-xs font-semibold rounded-lg transition ${
                      selectedOption === null
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/30'
                    }`}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
                  >
                    <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Assessment'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
