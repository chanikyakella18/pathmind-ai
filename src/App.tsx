import React, { useState, useEffect } from 'react';
import { Roadmap, RoadmapPhase, RoadmapTopic, RoadmapProject, UserProfile, AdaptationHistory } from './types/roadmap';
import { fetchRoadmaps, persistRoadmap, requestGenerateRoadmap } from './services/api';
import { DEFAULT_ROADMAPS } from './data/defaultRoadmaps';
import { Navbar } from './components/Navbar';
import { RoadmapHeader } from './components/RoadmapHeader';
import { PhaseTimeline } from './components/PhaseTimeline';
import { ProjectsView } from './components/ProjectsView';
import { QuizzesView } from './components/QuizzesView';
import { AdaptiveLogView } from './components/AdaptiveLogView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { QuizModal } from './components/QuizModal';
import { TopicModal } from './components/TopicModal';
import { ProjectModal } from './components/ProjectModal';
import { CreateRoadmapModal } from './components/CreateRoadmapModal';
import { exportRoadmapAsMarkdown } from './utils/exportRoadmap';
import { Sparkles, ArrowRight, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(DEFAULT_ROADMAPS);
  const [activeRoadmapId, setActiveRoadmapId] = useState<string>(DEFAULT_ROADMAPS[0].id);
  const [activeTab, setActiveTab] = useState<'stages' | 'projects' | 'quizzes' | 'adaptations' | 'planner'>('stages');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Quiz Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizTopicTitle, setQuizTopicTitle] = useState('');
  const [quizPhase, setQuizPhase] = useState<RoadmapPhase | null>(null);

  // Topic Modal State
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<RoadmapTopic | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<RoadmapPhase | null>(null);

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<RoadmapProject | null>(null);

  // Adaptive notification banner
  const [adaptiveNotification, setAdaptiveNotification] = useState<string | null>(null);

  // Fetch initial roadmaps from backend
  useEffect(() => {
    async function init() {
      try {
        const loaded = await fetchRoadmaps();
        if (loaded && loaded.length > 0) {
          setRoadmaps(loaded);
          // ensure activeRoadmapId exists
          if (!loaded.some((r) => r.id === activeRoadmapId)) {
            setActiveRoadmapId(loaded[0].id);
          }
        }
      } catch (e) {
        console.warn('Initial load fallback', e);
      }
    }
    init();
  }, []);

  const activeRoadmap =
    roadmaps.find((r) => r.id === activeRoadmapId) || roadmaps[0] || DEFAULT_ROADMAPS[0];

  // Helper to update active roadmap and persist
  const updateActiveRoadmap = (updated: Roadmap) => {
    const newRoadmaps = roadmaps.map((r) => (r.id === updated.id ? updated : r));
    setRoadmaps(newRoadmaps);
    persistRoadmap(updated);
  };

  // Toggle Topic Completed
  const handleToggleTopic = (phaseId: string, topicId: string) => {
    const updatedPhases = activeRoadmap.phases.map((phase) => {
      if (phase.id !== phaseId) return phase;
      const updatedTopics = phase.topics.map((t) => {
        if (t.id !== topicId) return t;
        const nowCompleted = !t.isCompleted;
        return {
          ...t,
          isCompleted: nowCompleted,
          completedAt: nowCompleted ? new Date().toISOString() : undefined,
        };
      });
      return {
        ...phase,
        topics: updatedTopics,
        isCompleted: updatedTopics.every((t) => t.isCompleted),
      };
    });

    const updatedRoadmap: Roadmap = {
      ...activeRoadmap,
      phases: updatedPhases,
      updatedAt: new Date().toISOString(),
    };
    updateActiveRoadmap(updatedRoadmap);

    // If modal is open, sync it
    if (selectedTopic && selectedTopic.id === topicId) {
      setSelectedTopic({
        ...selectedTopic,
        isCompleted: !selectedTopic.isCompleted,
      });
    }
  };

  // Toggle Project Built
  const handleToggleProject = (projectId: string) => {
    const updatedPhases = activeRoadmap.phases.map((phase) => {
      const updatedProjects = (phase.projects || []).map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          isCompleted: !proj.isCompleted,
        };
      });
      return {
        ...phase,
        projects: updatedProjects,
      };
    });

    const updatedRoadmap: Roadmap = {
      ...activeRoadmap,
      phases: updatedPhases,
      updatedAt: new Date().toISOString(),
    };
    updateActiveRoadmap(updatedRoadmap);

    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject({
        ...selectedProject,
        isCompleted: !selectedProject.isCompleted,
      });
    }
  };

  // Launch Quiz Modal
  const handleLaunchQuiz = (topicTitle: string, phase: RoadmapPhase) => {
    setQuizTopicTitle(topicTitle);
    setQuizPhase(phase);
    setIsQuizModalOpen(true);
  };

  // Open Topic Modal
  const handleOpenTopic = (topic: RoadmapTopic, phase: RoadmapPhase) => {
    setSelectedTopic(topic);
    setSelectedPhase(phase);
    setIsTopicModalOpen(true);
  };

  // Open Project Modal
  const handleOpenProject = (project: RoadmapProject) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  // Handle Adaptation Applied after a Quiz finishes!
  const handleAdaptationApplied = (
    adaptation: AdaptationHistory,
    remedialTopics: RoadmapTopic[],
    score: number
  ) => {
    if (!quizPhase) return;

    const updatedPhases = activeRoadmap.phases.map((phase) => {
      if (phase.id !== quizPhase.id) return phase;

      // Update quiz score on related topic if found
      const updatedTopics = phase.topics.map((t) => {
        if (t.title.toLowerCase().includes(quizTopicTitle.toLowerCase()) || quizTopicTitle.toLowerCase().includes(t.title.toLowerCase())) {
          return { ...t, quizScore: score };
        }
        return t;
      });

      // Inject new remedial topics if any
      const mergedTopics = remedialTopics.length > 0 ? [...updatedTopics, ...remedialTopics] : updatedTopics;
      const extraHours = remedialTopics.reduce((acc, cur) => acc + (cur.estimatedHours || 2), 0);

      return {
        ...phase,
        topics: mergedTopics,
        estimatedTotalHours: (phase.estimatedTotalHours || 0) + extraHours,
      };
    });

    const totalHours = updatedPhases.reduce(
      (sum, p) => sum + p.topics.reduce((acc, t) => acc + (t.estimatedHours || 0), 0),
      0
    );

    const updatedRoadmap: Roadmap = {
      ...activeRoadmap,
      phases: updatedPhases,
      totalEstimatedHours: totalHours,
      adaptations: [adaptation, ...(activeRoadmap.adaptations || [])],
      updatedAt: new Date().toISOString(),
    };

    updateActiveRoadmap(updatedRoadmap);

    // Show temporary banner
    setAdaptiveNotification(
      `AI Curriculum Adapted: ${adaptation.newTopicsAdded.length > 0 ? `${adaptation.newTopicsAdded.length} remedial module(s) injected into Phase ${quizPhase.phaseNumber}` : 'Mastery recorded and next milestone prioritized!'}`
    );
    setTimeout(() => setAdaptiveNotification(null), 8000);
  };

  // Create new Roadmap with Gemini
  const handleCreateRoadmap = async (profile: UserProfile) => {
    const generated = await requestGenerateRoadmap(profile);
    setRoadmaps([generated, ...roadmaps]);
    setActiveRoadmapId(generated.id);
    setActiveTab('stages');
  };

  // Export
  const handleExport = () => {
    exportRoadmapAsMarkdown(activeRoadmap);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sticky Navigation */}
      <Navbar
        roadmaps={roadmaps}
        activeRoadmapId={activeRoadmapId}
        onSelectRoadmap={(id) => setActiveRoadmapId(id)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onExportRoadmap={handleExport}
      />

      {/* Adaptive Notification Banner */}
      {adaptiveNotification && (
        <div className="bg-gradient-to-r from-amber-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in sticky top-16 z-30">
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
          <span>{adaptiveNotification}</span>
          <button
            onClick={() => setActiveTab('adaptations')}
            className="underline underline-offset-2 ml-2 hover:text-amber-200 cursor-pointer text-xs"
          >
            View Adaptive Log →
          </button>
        </div>
      )}

      {/* Hero / Header with Live Stats & Tab Bar */}
      <RoadmapHeader
        roadmap={activeRoadmap}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Tab Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'stages' && (
          <PhaseTimeline
            roadmap={activeRoadmap}
            onToggleTopic={handleToggleTopic}
            onOpenTopicModal={handleOpenTopic}
            onOpenQuizModal={handleLaunchQuiz}
            onOpenProjectModal={handleOpenProject}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            roadmap={activeRoadmap}
            onOpenProjectModal={handleOpenProject}
            onToggleProjectComplete={handleToggleProject}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizzesView
            roadmap={activeRoadmap}
            onLaunchQuiz={handleLaunchQuiz}
          />
        )}

        {activeTab === 'adaptations' && (
          <AdaptiveLogView
            roadmap={activeRoadmap}
            onLaunchQuiz={handleLaunchQuiz}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlannerView roadmap={activeRoadmap} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 PathMind AI • Personalized Staged Learning Plans with Measurable Progress</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini Intelligence</span>
            <span>•</span>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer"
            >
              Generate New Roadmap
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        topicTitle={quizTopicTitle}
        phase={quizPhase || activeRoadmap.phases[0]}
        targetCareer={activeRoadmap.userProfile.targetCareer}
        roadmapId={activeRoadmap.id}
        onAdaptationApplied={handleAdaptationApplied}
      />

      <TopicModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        topic={selectedTopic}
        phase={selectedPhase}
        onToggleComplete={() => {
          if (selectedPhase && selectedTopic) {
            handleToggleTopic(selectedPhase.id, selectedTopic.id);
          }
        }}
        onLaunchQuiz={() => {
          if (selectedTopic && selectedPhase) {
            handleLaunchQuiz(selectedTopic.title, selectedPhase);
          }
        }}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={selectedProject}
        targetCareer={activeRoadmap.userProfile.targetCareer}
        onToggleProjectComplete={handleToggleProject}
      />

      <CreateRoadmapModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRoadmap}
      />
    </div>
  );
}
