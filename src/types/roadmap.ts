export interface SkillItem {
  name: string;
  level: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced';
}

export interface UserProfile {
  currentSkills: SkillItem[];
  targetCareer: string;
  hoursPerDay: number;
  daysPerWeek: number;
  learningPace: 'Relaxed' | 'Balanced' | 'Intensive';
  learningStyle: 'Projects & Hands-on' | 'Theory & Deep-Dive' | 'Balanced Hybrid';
  additionalNotes?: string;
}

export interface LearningResource {
  title: string;
  type: 'documentation' | 'tutorial' | 'course' | 'book' | 'interactive' | 'practice';
  urlOrSearch: string;
  free: boolean;
  description?: string;
}

export interface RoadmapTopic {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  keyOutcomes: string[];
  resources: LearningResource[];
  isCompleted: boolean;
  completedAt?: string;
  isRemedialAdded?: boolean; // added by adaptive engine
  quizScore?: number;
}

export interface RoadmapProject {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Capstone';
  description: string;
  skillsLearned: string[];
  keyMilestones: string[];
  deliverables: string[];
  portfolioValue: string;
  isCompleted: boolean;
  starterPromptOrIdea?: string;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  tagline: string;
  focus: string;
  estimatedWeeks: number;
  estimatedTotalHours: number;
  topics: RoadmapTopic[];
  projects: RoadmapProject[];
  quizTopics: string[];
  isCompleted: boolean;
}

export interface AdaptationHistory {
  id: string;
  timestamp: string;
  triggerReason: string;
  quizTopic: string;
  score: number;
  identifiedGaps: string[];
  actionsTaken: string[];
  newTopicsAdded: string[];
  encouragement: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  conceptTested: string;
}

export interface QuizResult {
  id: string;
  roadmapId: string;
  phaseId: string;
  topicTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    conceptTested: string;
  }[];
  weakConcepts: string[];
  masteredConcepts: string[];
}

export interface Roadmap {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  summary: string;
  userProfile: UserProfile;
  totalEstimatedWeeks: number;
  totalEstimatedHours: number;
  phases: RoadmapPhase[];
  adaptations: AdaptationHistory[];
  quizHistory: QuizResult[];
}
