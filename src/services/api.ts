import { Roadmap, UserProfile, QuizQuestion, AdaptationHistory, RoadmapTopic } from '../types/roadmap';
import { DEFAULT_ROADMAPS } from '../data/defaultRoadmaps';

const LOCAL_STORAGE_KEY = 'ai_learning_roadmaps_v1';

export function getLocalRoadmaps(): Roadmap[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read localStorage:', e);
  }
  return DEFAULT_ROADMAPS;
}

export function saveLocalRoadmaps(roadmaps: Roadmap[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(roadmaps));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export async function fetchRoadmaps(): Promise<Roadmap[]> {
  try {
    const res = await fetch('/api/roadmaps');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalRoadmaps(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch /api/roadmaps, using local cache:', err);
  }
  return getLocalRoadmaps();
}

export async function persistRoadmap(roadmap: Roadmap): Promise<void> {
  const local = getLocalRoadmaps();
  const idx = local.findIndex((r) => r.id === roadmap.id);
  if (idx >= 0) {
    local[idx] = roadmap;
  } else {
    local.unshift(roadmap);
  }
  saveLocalRoadmaps(local);

  try {
    await fetch(`/api/roadmaps/${roadmap.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roadmap),
    });
  } catch (e) {
    console.warn('Backend sync failed, stored in localStorage:', e);
  }
}

export async function requestGenerateRoadmap(profile: UserProfile): Promise<Roadmap> {
  const res = await fetch('/api/roadmap/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate roadmap from AI.');
  }

  const generated: Roadmap = await res.json();
  const local = getLocalRoadmaps();
  local.unshift(generated);
  saveLocalRoadmaps(local);
  return generated;
}

export async function requestGenerateQuiz(
  topicTitle: string,
  phaseFocus: string,
  targetCareer: string
): Promise<{ topicTitle: string; questions: QuizQuestion[] }> {
  try {
    const res = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicTitle, phaseFocus, targetCareer }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Quiz generate API failed, fallback to offline quiz generator', e);
  }

  // Fallback high-quality interactive questions in case of network issue
  return {
    topicTitle,
    questions: [
      {
        id: `q_fb_1_${Date.now()}`,
        question: `In the context of ${topicTitle}, what is the primary architectural advantage of using vectorized operations over explicit loops?`,
        options: [
          'Vectorized operations allow executing in C/SIMD instruction level and bypass the Python Global Interpreter Lock overhead for that calculation.',
          'Vectorized operations always use less disk memory space.',
          'Vectorized loops execute asynchronously on background web workers.',
          'They automatically format data into readable CSV tables.',
        ],
        correctOptionIndex: 0,
        explanation: 'Vectorized computing relies on low-level SIMD (Single Instruction, Multiple Data) CPU/GPU operations and contiguous memory, bypassing Python bytecode iteration overhead.',
        conceptTested: 'Vectorization & Hardware Acceleration',
      },
      {
        id: `q_fb_2_${Date.now()}`,
        question: `When designing a production pipeline for ${topicTitle}, what is the most critical safeguard against data leakage?`,
        options: [
          'Training on the test split first to establish baseline loss.',
          'Fitting scalers and transformers ONLY on the training split before transforming the validation/test splits.',
          'Using unnormalized float64 precision throughout all layers.',
          'Deleting all categorical columns before training.',
        ],
        correctOptionIndex: 1,
        explanation: 'Data leakage happens when information from outside the training dataset is used to create the model (e.g. fitting a MinMaxScaler or calculating mean across the whole dataset).',
        conceptTested: 'Data Leakage & Evaluation Hygiene',
      },
      {
        id: `q_fb_3_${Date.now()}`,
        question: `Consider an edge-case scenario in ${topicTitle}: If your validation loss begins rising while training loss continues decreasing, what is occurring?`,
        options: [
          'Underfitting; the model lacks capacity to capture patterns.',
          'Overfitting; the model is memorizing noise in the training set and losing generalizability.',
          'Gradient explosion; the weights have become NaN.',
          'Hardware throttling due to GPU memory limits.',
        ],
        correctOptionIndex: 1,
        explanation: 'Divergence between decreasing training loss and increasing validation loss is the classic diagnostic signature of overfitting.',
        conceptTested: 'Bias-Variance & Overfitting Diagnosis',
      },
      {
        id: `q_fb_4_${Date.now()}`,
        question: `How does real-world metric selection tie into the goal of ${targetCareer}?`,
        options: [
          'Accuracy is always sufficient for all machine learning problems.',
          'Business objectives determine the trade-off between False Positives and False Negatives, making ROC-AUC, PR-AUC, or F-beta score more meaningful than raw accuracy.',
          'Models must only be evaluated by raw execution speed (inference latency).',
          'Only p-values below 0.001 are acceptable for production APIs.',
        ],
        correctOptionIndex: 1,
        explanation: 'Imbalanced datasets (e.g. fraud detection, medical diagnoses, spam) make accuracy deceptive; precision-recall trade-offs reflect true operational consequences.',
        conceptTested: 'Operational Metric Alignment',
      },
    ],
  };
}

export async function requestAdaptRoadmap(payload: {
  roadmapId: string;
  phaseId: string;
  topicTitle: string;
  score: number;
  totalQuestions: number;
  weakConcepts: string[];
  masteredConcepts: string[];
  answers: any[];
  targetCareer: string;
  hoursPerDay?: number;
}): Promise<{
  adaptationRecord: AdaptationHistory;
  remedialTopics: RoadmapTopic[];
}> {
  try {
    const res = await fetch('/api/roadmap/adapt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Adapt API call failed, generating intelligent client-side adaptation:', e);
  }

  // Intelligent fallback adaptation
  const isStruggling = payload.score < 75;
  const adaptationRecord: AdaptationHistory = {
    id: `adapt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    triggerReason: `Quiz on "${payload.topicTitle}" resulted in ${payload.score}% score`,
    quizTopic: payload.topicTitle,
    score: payload.score,
    identifiedGaps: isStruggling
      ? payload.weakConcepts.length > 0
        ? payload.weakConcepts
        : ['Core fundamentals & edge cases in ' + payload.topicTitle]
      : ['Minor nuances in advanced configurations'],
    actionsTaken: isStruggling
      ? [
          `Injected targeted remedial module: "Core Intuition & Practice for ${payload.topicTitle}"`,
          'Recommended 2 interactive visual simulation resources',
          'Added 3 buffer hours to master prerequisites before moving to next milestone',
        ]
      : [
          'Verified high concept retention (>75% mastery)',
          'Unlocked recommended accelerated milestone track',
          'Fast-tracked next stage practical project',
        ],
    newTopicsAdded: isStruggling
      ? [`Remedial Focus: Essential Drills on ${payload.topicTitle}`]
      : [],
    encouragement: isStruggling
      ? `Don't worry! Gaps are natural learning checkpoints. We adapted your roadmap with a focused booster topic to cement your understanding before advancing.`
      : `Spectacular job! Your score of ${payload.score}% demonstrates solid command over ${payload.topicTitle}. Ready for the next challenge!`,
  };

  const remedialTopics: RoadmapTopic[] = isStruggling
    ? [
        {
          id: `remedial_${Date.now()}`,
          title: `Reinforcement Drill: ${payload.topicTitle} Deep Dive`,
          description: `Targeted review addressing missed questions on ${payload.weakConcepts.join(', ') || payload.topicTitle}. Focuses on first principles and practical code snippets.`,
          estimatedHours: 2,
          keyOutcomes: [
            `Resolve misconceptions around ${payload.weakConcepts[0] || 'core concepts'}`,
            'Complete 3 guided self-tests with immediate console feedback',
            'Solidify conceptual intuition with visual diagrams',
          ],
          resources: [
            {
              title: `Interactive Sandbox for ${payload.topicTitle}`,
              type: 'interactive',
              urlOrSearch: `https://duckduckgo.com/?q=${encodeURIComponent(payload.topicTitle + ' tutorial visual guide')}`,
              free: true,
              description: 'Targeted visual drills for this specific domain.',
            },
          ],
          isCompleted: false,
          isRemedialAdded: true,
        },
      ]
    : [];

  return { adaptationRecord, remedialTopics };
}

export async function requestProjectGuide(
  projectTitle: string,
  skillsLearned: string[],
  targetCareer: string
): Promise<any> {
  try {
    const res = await fetch('/api/project/generate-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectTitle, skillsLearned, targetCareer }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Project guide fetch failed:', e);
  }

  return {
    projectTitle,
    elevatorPitch: `A production-ready portfolio highlight designed for aspiring ${targetCareer} candidates, demonstrating end-to-end implementation with ${skillsLearned.join(', ')}.`,
    architecture: 'Modular service structure: Ingestion layer -> Processing/Model engine -> Storage / Vector Cache -> API controller -> Client Interface.',
    datasetsAndTools: [
      'Hugging Face Datasets / Kaggle open benchmarks',
      'Docker for reproducible deployment',
      'GitHub Actions for automated CI tests',
    ],
    milestones: [
      {
        stepNumber: 1,
        title: 'Project Ingestion & Environment Setup',
        description: 'Initialize directory structure, virtual environments, linting, and dependency locks.',
        keyTasks: ['Setup Git repo with pre-commit hooks', 'Implement config schema validation with dotenv / Pydantic'],
      },
      {
        stepNumber: 2,
        title: 'Core Algorithm & Logic Implementation',
        description: 'Implement the primary logic and data pipelines.',
        keyTasks: ['Write vector math / model orchestration routines', 'Add unit tests with mock inputs'],
      },
      {
        stepNumber: 3,
        title: 'API & UI Presentation Layer',
        description: 'Expose endpoints and build a polished interface.',
        keyTasks: ['Deploy interactive Streamlit/React web frontend', 'Instrument latency and error telemetry'],
      },
      {
        stepNumber: 4,
        title: 'Evaluation, Benchmarks & Documentation',
        description: 'Quantify accuracy/throughput and produce a compelling README with architecture diagrams.',
        keyTasks: ['Document step-by-step setup in README', 'Record a 90-second Loom demonstration for your resume'],
      },
    ],
    interviewHighlights: [
      'Explain how you chose the architecture and metrics over alternatives.',
      'Discuss how you handled edge cases like memory constraints or rate limits.',
      'Highlight trade-offs between latency, cost, and accuracy.',
    ],
  };
}
