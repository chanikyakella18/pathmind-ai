import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client safely
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (e) {
    console.warn('Could not instantiate GoogleGenAI client:', e);
    return null;
  }
}

// Persistence storage file
const DATA_DIR = path.join(__dirname, 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'roadmaps.json');

function ensureStorageFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify([]), 'utf-8');
  }
}

function loadSavedRoadmaps(): any[] {
  try {
    ensureStorageFile();
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading roadmaps file:', err);
    return [];
  }
}

function saveRoadmaps(roadmaps: any[]) {
  try {
    ensureStorageFile();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(roadmaps, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving roadmaps file:', err);
  }
}

// GET all roadmaps
app.get('/api/roadmaps', (_req: Request, res: Response) => {
  const roadmaps = loadSavedRoadmaps();
  res.json(roadmaps);
});

// POST save a new or cloned roadmap
app.post('/api/roadmaps', (req: Request, res: Response) => {
  const roadmap = req.body;
  if (!roadmap || !roadmap.id) {
    res.status(400).json({ error: 'Valid roadmap payload is required' });
    return;
  }
  const roadmaps = loadSavedRoadmaps();
  const existingIdx = roadmaps.findIndex((r) => r.id === roadmap.id);
  if (existingIdx >= 0) {
    roadmaps[existingIdx] = roadmap;
  } else {
    roadmaps.unshift(roadmap);
  }
  saveRoadmaps(roadmaps);
  res.json(roadmap);
});

// PUT update roadmap
app.put('/api/roadmaps/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = req.body;
  const roadmaps = loadSavedRoadmaps();
  const idx = roadmaps.findIndex((r) => r.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Roadmap not found' });
    return;
  }
  roadmaps[idx] = { ...roadmaps[idx], ...updated, updatedAt: new Date().toISOString() };
  saveRoadmaps(roadmaps);
  res.json(roadmaps[idx]);
});

// DELETE roadmap
app.delete('/api/roadmaps/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let roadmaps = loadSavedRoadmaps();
  roadmaps = roadmaps.filter((r) => r.id !== id);
  saveRoadmaps(roadmaps);
  res.json({ success: true });
});

// Fallback Roadmap Generator (Deterministic & Resilient)
function buildDeterministicRoadmap(params: {
  currentSkills: any[];
  targetCareer: string;
  hoursPerDay: number;
  daysPerWeek: number;
  learningPace: string;
  learningStyle: string;
  additionalNotes?: string;
}) {
  const { targetCareer = 'Software Specialist', hoursPerDay = 1, daysPerWeek = 7, currentSkills = [] } = params;
  const weeklyHours = Math.max(1, Math.round(Number(hoursPerDay) * Number(daysPerWeek)));
  const phase1Weeks = 4;
  const phase2Weeks = 5;
  const phase3Weeks = 5;
  const phase4Weeks = 6;
  const totalWeeks = phase1Weeks + phase2Weeks + phase3Weeks + phase4Weeks;

  const phases = [
    {
      id: `phase_1_${Date.now()}`,
      phaseNumber: 1,
      title: `Phase 1: Foundational Tooling & Core Principles for ${targetCareer}`,
      tagline: `Master prerequisite programming, math, and software hygiene.`,
      focus: `Syntax mastery, environment setup, algorithmic logic, and fundamental problem-solving.`,
      estimatedWeeks: phase1Weeks,
      estimatedTotalHours: phase1Weeks * weeklyHours,
      isCompleted: false,
      quizTopics: [`Core Syntax & Types`, `Data Structures & Memory Basics`, `Algorithmic Problem Solving`],
      topics: [
        {
          id: `top_1_1_${Date.now()}`,
          title: `Fundamental Architecture & Core Environment`,
          description: `Master language runtime mechanics, virtual environments, version control, and modular structure.`,
          estimatedHours: Math.round((phase1Weeks * weeklyHours) * 0.4),
          isCompleted: false,
          keyOutcomes: [
            `Configure a reproducible development environment with linters and testing framework`,
            `Master core syntax, primitive types, and control flow mechanics`,
            `Implement clean modular code separation following industry standards`,
          ],
          resources: [
            {
              title: `Official Documentation & Best Practices Guide`,
              type: 'documentation',
              urlOrSearch: `https://duckduckgo.com/?q=${encodeURIComponent(targetCareer + ' official documentation getting started')}`,
              free: true,
              description: `High-yield starting point and reference manuals.`,
            },
          ],
        },
        {
          id: `top_1_2_${Date.now()}`,
          title: `Data Structures & Algorithm Essentials for ${targetCareer}`,
          description: `Array, hash maps, trees, Big-O complexity analysis, and writing memory-efficient routines.`,
          estimatedHours: Math.round((phase1Weeks * weeklyHours) * 0.6),
          isCompleted: false,
          keyOutcomes: [
            `Analyze time and space complexity with Big-O notation`,
            `Implement essential lookup and search data structures from scratch`,
            `Optimize compute routines for high-throughput execution`,
          ],
          resources: [
            {
              title: `Interactive Data Structures Visualizer`,
              type: 'interactive',
              urlOrSearch: `https://visualgo.net/en`,
              free: true,
              description: `Visual walkthrough of algorithmic mechanics.`,
            },
          ],
        },
      ],
      projects: [
        {
          id: `proj_1_${Date.now()}`,
          title: `Core Foundation CLI & Benchmark Utility`,
          difficulty: 'Beginner',
          description: `A self-contained tool showcasing clean code architecture, error handling, and unit test suites.`,
          skillsLearned: ['Clean Code', 'CLI Design', 'Unit Testing', 'Version Control'],
          keyMilestones: [
            `Setup repository with pre-commit hooks and linting`,
            `Implement core algorithm logic with comprehensive unit tests`,
            `Build CLI interface with argument parsing and structured logging`,
          ],
          deliverables: ['GitHub repository', 'Unit test suite with 90%+ coverage', 'Clean documentation README'],
          portfolioValue: `Proves code discipline and professional engineering foundations.`,
          isCompleted: false,
        },
      ],
    },
    {
      id: `phase_2_${Date.now()}`,
      phaseNumber: 2,
      title: `Phase 2: Applied Architecture & Core Frameworks`,
      tagline: `Transition from isolated scripts to scalable frameworks and data persistence.`,
      focus: `Framework conventions, API design, database schemas, and integration pipelines.`,
      estimatedWeeks: phase2Weeks,
      estimatedTotalHours: phase2Weeks * weeklyHours,
      isCompleted: false,
      quizTopics: [`Framework Patterns`, `Database Indexing & Query Design`, `API Contracts & Security`],
      topics: [
        {
          id: `top_2_1_${Date.now()}`,
          title: `Modern Frameworks & Service Architecture`,
          description: `Build structured microservices or modular pipelines adhering to domain-driven design principles.`,
          estimatedHours: Math.round((phase2Weeks * weeklyHours) * 0.5),
          isCompleted: false,
          keyOutcomes: [
            `Architect maintainable services with clear separation of concerns`,
            `Design RESTful and event-driven API contracts with schema validation`,
            `Handle concurrency, async patterns, and error recovery`,
          ],
          resources: [
            {
              title: `Production Architecture Guide`,
              type: 'tutorial',
              urlOrSearch: `https://duckduckgo.com/?q=${encodeURIComponent(targetCareer + ' architectural patterns tutorial')}`,
              free: true,
              description: `Pragmatic best practices for modern services.`,
            },
          ],
        },
        {
          id: `top_2_2_${Date.now()}`,
          title: `Data Layer: Storage, Queries & Performance`,
          description: `Database modeling, indexing strategies, caching mechanisms, and connection pooling.`,
          estimatedHours: Math.round((phase2Weeks * weeklyHours) * 0.5),
          isCompleted: false,
          keyOutcomes: [
            `Design normalized and denormalized data models with integrity constraints`,
            `Write high-performance queries and analyze execution plans`,
            `Implement atomic transactions and caching layers to minimize latency`,
          ],
          resources: [
            {
              title: `Database Optimization Masterclass`,
              type: 'course',
              urlOrSearch: `https://use-the-index-luke.com/`,
              free: true,
              description: `The standard guide to database indexing and performance.`,
            },
          ],
        },
      ],
      projects: [
        {
          id: `proj_2_${Date.now()}`,
          title: `Scalable Data Pipeline & Service Backend`,
          difficulty: 'Intermediate',
          description: `An end-to-end service providing secure API endpoints, background worker jobs, and real-time event updates.`,
          skillsLearned: ['Service Design', 'Database Modeling', 'API Security', 'Caching'],
          keyMilestones: [
            `Create relational/document schema with migrations`,
            `Implement authenticated endpoints with rate limiting`,
            `Deploy worker queue for asynchronous task processing`,
          ],
          deliverables: ['Live deployed service', 'Interactive API specification', 'Database schema diagram'],
          portfolioValue: `Demonstrates full-stack competence and robust backend architecture.`,
          isCompleted: false,
        },
      ],
    },
    {
      id: `phase_3_${Date.now()}`,
      phaseNumber: 3,
      title: `Phase 3: Advanced Systems & Domain Specialization`,
      tagline: `Master specialized algorithms, distributed mechanics, and optimization.`,
      focus: `High-concurrency systems, domain-specific algorithms, profiling, and optimization.`,
      estimatedWeeks: phase3Weeks,
      estimatedTotalHours: phase3Weeks * weeklyHours,
      isCompleted: false,
      quizTopics: [`Advanced Optimization`, `Distributed Systems & Caching`, `Security & Threat Models`],
      topics: [
        {
          id: `top_3_1_${Date.now()}`,
          title: `High-Performance Engineering & Profiling`,
          description: `Benchmarking, CPU/memory profiling, eliminating bottlenecks, and low-latency design.`,
          estimatedHours: Math.round((phase3Weeks * weeklyHours) * 0.5),
          isCompleted: false,
          keyOutcomes: [
            `Profile application hotspots using flame graphs and CPU analyzers`,
            `Reduce memory allocation footprint and garbage collection overhead`,
            `Instrument OpenTelemetry metrics and structured distributed tracing`,
          ],
          resources: [
            {
              title: `High Performance Systems Engineering`,
              type: 'book',
              urlOrSearch: `https://duckduckgo.com/?q=${encodeURIComponent(targetCareer + ' performance optimization profiling')}`,
              free: true,
              description: `Techniques to squeeze maximum performance out of hardware.`,
            },
          ],
        },
        {
          id: `top_3_2_${Date.now()}`,
          title: `Domain Specialization: Modern AI & Cloud Ecosystems`,
          description: `Integrate modern AI APIs, vector search, streaming data, and cloud-native services.`,
          estimatedHours: Math.round((phase3Weeks * weeklyHours) * 0.5),
          isCompleted: false,
          keyOutcomes: [
            `Incorporate intelligent AI endpoints, embeddings, or inference pipelines`,
            `Design resilient fallback mechanisms and exponential backoff retry loops`,
            `Enforce security perimeter against injection, leakage, and unauthorized access`,
          ],
          resources: [
            {
              title: `Modern AI & Cloud Engineering Handbook`,
              type: 'tutorial',
              urlOrSearch: `https://ai.google.dev/gemini-api/docs`,
              free: true,
              description: `Official documentation on intelligent APIs and tool calling.`,
            },
          ],
        },
      ],
      projects: [
        {
          id: `proj_3_${Date.now()}`,
          title: `Intelligent High-Throughput Application Suite`,
          difficulty: 'Advanced',
          description: `A production-ready platform featuring intelligent automation, real-time analytics, and automated testing suites.`,
          skillsLearned: ['AI Integration', 'Telemetry', 'Distributed Systems', 'Cloud Native'],
          keyMilestones: [
            `Build streaming client-server connection`,
            `Integrate vector memory or intelligent data transformation pipeline`,
            `Instrument live Grafana/Prometheus performance dashboard`,
          ],
          deliverables: ['Publicly accessible application', 'Load test benchmark report (200+ req/sec)', 'Recorded demo'],
          portfolioValue: `High-leverage artifact that separates senior engineers from junior candidates.`,
          isCompleted: false,
        },
      ],
    },
    {
      id: `phase_4_${Date.now()}`,
      phaseNumber: 4,
      title: `Phase 4: Production Deployment & Capstone Portfolio`,
      tagline: `Package, containerize, deploy to cloud, and prepare for interviews.`,
      focus: `Docker containerization, CI/CD automation, cloud deployment, and technical interview defense.`,
      estimatedWeeks: phase4Weeks,
      estimatedTotalHours: phase4Weeks * weeklyHours,
      isCompleted: false,
      quizTopics: [`Docker & Container Isolation`, `CI/CD Automation Pipelines`, `Production Observability`],
      topics: [
        {
          id: `top_4_1_${Date.now()}`,
          title: `Containerization, Docker & Cloud Deployment`,
          description: `Multi-stage Docker builds, health checks, environment secrets, and autoscaling cloud hosts.`,
          estimatedHours: Math.round((phase4Weeks * weeklyHours) * 0.5),
          isCompleted: false,
          keyOutcomes: [
            `Write secure, minimal multi-stage Dockerfiles under 200MB`,
            `Configure zero-downtime rolling updates with health probe checks`,
            `Deploy containerized services to cloud infrastructure (Cloud Run, AWS, or GCP)`,
          ],
          resources: [
            {
              title: `Docker Best Practices Handbook`,
              type: 'documentation',
              urlOrSearch: `https://docs.docker.com/develop/develop-images/dockerfile_best-practices/`,
              free: true,
              description: `Essential guide for writing secure, production-grade containers.`,
            },
          ],
        },
        {
          id: `top_4_2_${Date.now()}`,
          title: `Automated CI/CD & Technical Portfolio Defense`,
          description: `GitHub Actions pipelines, automated regression testing, and articulating architectural decisions in interviews.`,
          estimatedHours: Math.round((phase4Weeks * weeklyHours) * 0.5),
          isCompleted: false,
          keyOutcomes: [
            `Construct automated GitHub Actions pipelines running tests on pull requests`,
            `Formulate STAR-method interview talking points for each portfolio project`,
            `Write concise architecture decision records (ADRs) explaining trade-offs`,
          ],
          resources: [
            {
              title: `Technical Interview System Design Handbook`,
              type: 'course',
              urlOrSearch: `https://github.com/donnemartin/system-design-primer`,
              free: true,
              description: `The gold standard open-source guide to technical interview excellence.`,
            },
          ],
        },
      ],
      projects: [
        {
          id: `proj_4_${Date.now()}`,
          title: `Enterprise Production Capstone: ${targetCareer} Flagship`,
          difficulty: 'Capstone',
          description: `A complete, live, cloud-deployed product showcasing the entire curriculum, complete with documentation, CI/CD, and monitoring.`,
          skillsLearned: ['Docker', 'Cloud Run', 'CI/CD', 'Full-Lifecycle Engineering', 'System Design'],
          keyMilestones: [
            `Deploy end-to-end cloud infrastructure with continuous deployment`,
            `Produce comprehensive documentation with architecture diagrams`,
            `Record a 90-second technical overview video highlighting trade-offs`,
          ],
          deliverables: ['Live production URL', 'GitHub repository with automated badges', 'Comprehensive case study writeup'],
          portfolioValue: `The definitive proof of job-readiness for ${targetCareer}.`,
          isCompleted: false,
        },
      ],
    },
  ];

  return {
    id: `rm_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: `${targetCareer} Comprehensive Career Roadmap`,
    summary: `Personalized, staged learning roadmap tailored for aspiring ${targetCareer} specialists, calibrated for ${hoursPerDay} hr/day (~${weeklyHours} hrs/week).`,
    userProfile: {
      currentSkills,
      targetCareer,
      hoursPerDay,
      daysPerWeek,
      learningPace: params.learningPace || 'Balanced',
      learningStyle: params.learningStyle || 'Balanced Hybrid',
      additionalNotes: params.additionalNotes || '',
    },
    totalEstimatedWeeks: totalWeeks,
    totalEstimatedHours: totalWeeks * weeklyHours,
    phases,
    adaptations: [],
    quizHistory: [],
  };
}

// POST Generate Roadmap
app.post('/api/roadmap/generate', async (req: Request, res: Response) => {
  try {
    const {
      currentSkills = [],
      targetCareer,
      hoursPerDay = 1,
      daysPerWeek = 7,
      learningPace = 'Balanced',
      learningStyle = 'Balanced Hybrid',
      additionalNotes = '',
    } = req.body;

    if (!targetCareer) {
      res.status(400).json({ error: 'Target career is required.' });
      return;
    }

    const weeklyHours = Number(hoursPerDay) * Number(daysPerWeek);
    const skillsSummary = Array.isArray(currentSkills)
      ? currentSkills.map((s: any) => `${s.name} (${s.level || 'Beginner'})`).join(', ')
      : 'None specified';

    const ai = getGeminiClient();

    if (!ai) {
      const fallback = buildDeterministicRoadmap({
        currentSkills,
        targetCareer,
        hoursPerDay,
        daysPerWeek,
        learningPace,
        learningStyle,
        additionalNotes,
      });
      const roadmaps = loadSavedRoadmaps();
      roadmaps.unshift(fallback);
      saveRoadmaps(roadmaps);
      res.json(fallback);
      return;
    }

    const prompt = `You are a principal career curriculum architect and learning scientist.
Create an exhaustive, structured, highly practical personalized learning roadmap for a student aiming for: "${targetCareer}".

STUDENT PROFILE:
- Target Career: ${targetCareer}
- Current Skills & Proficiencies: ${skillsSummary}
- Study Commitment: ${hoursPerDay} hour(s) per day, ${daysPerWeek} days per week (~${weeklyHours} hours/week)
- Learning Pace: ${learningPace}
- Learning Style: ${learningStyle}
- Additional Context/Goals: ${additionalNotes || 'N/A'}

INSTRUCTIONS:
1. Divide the journey into 4 to 6 logical staged phases.
2. For each phase:
   - Provide an inspiring title, a punchy tagline, and core focus.
   - Accurately calculate realistic estimated weeks and hours strictly based on their available study time (~${weeklyHours} hours/week).
   - Detail 3 to 5 crucial topics with clear, tangible descriptions, hours, key learning outcomes, and high-quality curated learning resources.
   - Recommend 1 to 2 realistic hands-on practice projects per phase with specific tech stacks, milestones, and portfolio highlights.
   - List 3 key quiz topics for this phase to evaluate knowledge.
3. Make sure the progression bridges the gap from their current skills to job-readiness for "${targetCareer}".

Return strict JSON adhering to schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            totalEstimatedWeeks: { type: Type.INTEGER },
            totalEstimatedHours: { type: Type.INTEGER },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  estimatedWeeks: { type: Type.INTEGER },
                  estimatedTotalHours: { type: Type.INTEGER },
                  quizTopics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        estimatedHours: { type: Type.INTEGER },
                        keyOutcomes: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        resources: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              title: { type: Type.STRING },
                              type: { type: Type.STRING },
                              urlOrSearch: { type: Type.STRING },
                              free: { type: Type.BOOLEAN },
                              description: { type: Type.STRING },
                            },
                            required: ['title', 'type', 'urlOrSearch', 'free'],
                          },
                        },
                      },
                      required: ['title', 'description', 'estimatedHours', 'keyOutcomes', 'resources'],
                    },
                  },
                  projects: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        description: { type: Type.STRING },
                        skillsLearned: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        keyMilestones: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        deliverables: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        portfolioValue: { type: Type.STRING },
                      },
                      required: ['title', 'difficulty', 'description', 'skillsLearned', 'keyMilestones', 'deliverables', 'portfolioValue'],
                    },
                  },
                },
                required: ['phaseNumber', 'title', 'tagline', 'focus', 'estimatedWeeks', 'estimatedTotalHours', 'topics', 'projects', 'quizTopics'],
              },
            },
          },
          required: ['title', 'summary', 'totalEstimatedWeeks', 'totalEstimatedHours', 'phases'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Add unique IDs and completion states
    const roadmapId = 'rm_' + Date.now();
    const hydratedPhases = (parsed.phases || []).map((phase: any, pIdx: number) => {
      const phaseId = `phase_${pIdx + 1}_${Date.now()}`;
      return {
        ...phase,
        id: phaseId,
        isCompleted: false,
        topics: (phase.topics || []).map((topic: any, tIdx: number) => ({
          ...topic,
          id: `top_${pIdx + 1}_${tIdx + 1}_${Date.now()}`,
          isCompleted: false,
        })),
        projects: (phase.projects || []).map((project: any, prIdx: number) => ({
          ...project,
          id: `proj_${pIdx + 1}_${prIdx + 1}_${Date.now()}`,
          isCompleted: false,
        })),
      };
    });

    const fullRoadmap = {
      id: roadmapId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: parsed.title || `${targetCareer} Mastery Roadmap`,
      summary: parsed.summary || `Personalized learning roadmap designed for ${targetCareer}.`,
      userProfile: {
        currentSkills,
        targetCareer,
        hoursPerDay,
        daysPerWeek,
        learningPace,
        learningStyle,
        additionalNotes,
      },
      totalEstimatedWeeks: parsed.totalEstimatedWeeks || 24,
      totalEstimatedHours: parsed.totalEstimatedHours || 168,
      phases: hydratedPhases,
      adaptations: [],
      quizHistory: [],
    };

    const currentRoadmaps = loadSavedRoadmaps();
    currentRoadmaps.unshift(fullRoadmap);
    saveRoadmaps(currentRoadmaps);

    res.json(fullRoadmap);
  } catch (err: any) {
    console.warn('Gemini roadmap generation fallback triggered:', err?.message || err);
    const fallback = buildDeterministicRoadmap(req.body);
    const roadmaps = loadSavedRoadmaps();
    roadmaps.unshift(fallback);
    saveRoadmaps(roadmaps);
    res.json(fallback);
  }
});

// POST Generate Quiz
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
  try {
    const { topicTitle, phaseFocus, targetCareer } = req.body;

    if (!topicTitle) {
      res.status(400).json({ error: 'Topic title is required to generate a quiz.' });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      res.json(buildDeterministicQuiz(topicTitle, phaseFocus, targetCareer));
      return;
    }

    const prompt = `You are an expert technical interviewer in ${targetCareer || 'Technology'}.
Generate a rigorous 4-question technical quiz specifically testing understanding of:
Topic: "${topicTitle}"
Context/Phase Focus: "${phaseFocus || 'Core Concepts'}"
Target Career: "${targetCareer || 'Specialist'}"

Requirements:
- Questions should test real conceptual understanding, practical intuition, or scenario diagnosis.
- Include a short code snippet or scenario if relevant to the topic.
- Provide 4 distinct options per question.
- Mark the correct option index (0 to 3).
- Provide a clear, educational explanation of why the correct option is right.
- Tag the specific granular concept being tested.

Return strict JSON adhering to schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topicTitle: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  codeSnippet: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOptionIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  conceptTested: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctOptionIndex', 'explanation', 'conceptTested'],
              },
            },
          },
          required: ['topicTitle', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const hydratedQuestions = (parsed.questions || []).map((q: any, i: number) => ({
      ...q,
      id: `q_${Date.now()}_${i}`,
    }));

    res.json({
      topicTitle: parsed.topicTitle || topicTitle,
      questions: hydratedQuestions,
    });
  } catch (err: any) {
    console.warn('Quiz generation fallback triggered:', err?.message || err);
    res.json(buildDeterministicQuiz(req.body.topicTitle, req.body.phaseFocus, req.body.targetCareer));
  }
});

function buildDeterministicQuiz(topicTitle: string, _phaseFocus?: string, targetCareer?: string) {
  return {
    topicTitle: topicTitle || 'Core Competency',
    questions: [
      {
        id: `q_det_1_${Date.now()}`,
        question: `When implementing ${topicTitle}, what is the primary consideration for achieving high reliability in production?`,
        options: [
          `Decoupling critical business logic, handling edge-case inputs gracefully, and validating data boundaries with strict schemas.`,
          `Increasing memory allocation without modifying underlying algorithms.`,
          `Disabling logging and monitoring to conserve CPU cycles.`,
          `Running operations synchronously on a single blocking thread.`,
        ],
        correctOptionIndex: 0,
        explanation: `Reliable systems prioritize strict input schema validation, isolated modular boundaries, and structured error propagation to avoid cascading system failures.`,
        conceptTested: `Resilient Architecture & Validation`,
      },
      {
        id: `q_det_2_${Date.now()}`,
        question: `In the context of ${topicTitle || 'system design'}, what is the most common diagnostic symptom of data leakage or state pollution?`,
        options: [
          `Inconsistent test and production behavior caused by training or processing pipelines sharing state across isolated partitions.`,
          `Increased network bandwidth on local loops.`,
          `Higher disk encryption latency.`,
          `Unexpected UI font re-rendering.`,
        ],
        correctOptionIndex: 0,
        explanation: `State pollution occurs when shared global state or leaky transformers inadvertently bleed information across independent requests or evaluation splits.`,
        conceptTested: `State Isolation & Hygiene`,
      },
      {
        id: `q_det_3_${Date.now()}`,
        question: `When optimizing performance for ${topicTitle}, which strategy yields the highest computational efficiency?`,
        options: [
          `Leveraging vectorized batch execution and zero-copy contiguous memory buffers over nested iterative loops.`,
          `Adding sleep timers between task iterations.`,
          `Re-instantiating connections on every single request.`,
          `Duplicating uncompressed datasets into global memory.`,
        ],
        correctOptionIndex: 0,
        explanation: `Vectorized batch processing utilizes hardware SIMD acceleration and minimizes runtime interpreter overhead, yielding up to 50x throughput gains.`,
        conceptTested: `Vectorization & Memory Optimization`,
      },
      {
        id: `q_det_4_${Date.now()}`,
        question: `How does real-world metric evaluation align with career goals in ${targetCareer || 'Engineering'}?`,
        options: [
          `Evaluating systems based on operational trade-offs (e.g. latency, precision vs recall, resource cost) rather than superficial vanity metrics.`,
          `Relying exclusively on raw line count of code written.`,
          `Choosing the most complex theoretical model regardless of business constraints.`,
          `Skipping automated integration testing in favor of manual checks.`,
        ],
        correctOptionIndex: 0,
        explanation: `Engineering maturity requires balancing operational reality: measuring exact trade-offs like latency bounds, precision vs recall, and infrastructure efficiency.`,
        conceptTested: `Trade-off Analysis & Metric Evaluation`,
      },
    ],
  };
}

// POST Adapt Roadmap Based on Quiz Performance
app.post('/api/roadmap/adapt', async (req: Request, res: Response) => {
  try {
    const {
      roadmapId,
      phaseId,
      topicTitle,
      score,
      totalQuestions = 4,
      weakConcepts = [],
      masteredConcepts = [],
      answers = [],
      targetCareer,
    } = req.body;

    const isStruggling = score < 75;
    const ai = getGeminiClient();

    let parsed: any = null;

    if (ai) {
      try {
        const prompt = `You are an adaptive AI learning scientist and mentor.
A student in an interactive roadmap for "${targetCareer || 'Career Track'}" just completed a quiz on topic "${topicTitle}".
Their Quiz Score: ${score}% (${score < 50 ? 'Needs Urgent Remediation' : score < 75 ? 'Needs Focused Reinforcement' : 'Mastered / Strong Understanding'}).
Tested Concepts:
- Weak/Missed Concepts: ${weakConcepts.join(', ') || (isStruggling ? 'Core principles missed' : 'None')}
- Mastered Concepts: ${masteredConcepts.join(', ') || 'General basics'}

Your mission is to adapt their future learning plan based on this measurable performance:
1. Identify specific cognitive gaps or misconceptions.
2. Outline concrete adaptations taken on their learning plan:
   - If score < 75%: Inject 1 to 2 targeted remedial micro-topics, adjust time buffer, and recommend specific corrective action.
   - If score >= 75%: Commend their mastery, suggest an optional high-leverage "Pro Challenge".
3. Provide an encouraging mentor breakdown message.

Return strict JSON adhering to schema.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                identifiedGaps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                actionsTaken: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                encouragement: { type: Type.STRING },
                remedialTopics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      estimatedHours: { type: Type.INTEGER },
                      keyOutcomes: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      resources: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            type: { type: Type.STRING },
                            urlOrSearch: { type: Type.STRING },
                            free: { type: Type.BOOLEAN },
                            description: { type: Type.STRING },
                          },
                          required: ['title', 'type', 'urlOrSearch', 'free'],
                        },
                      },
                    },
                    required: ['title', 'description', 'estimatedHours', 'keyOutcomes', 'resources'],
                  },
                },
              },
              required: ['identifiedGaps', 'actionsTaken', 'encouragement', 'remedialTopics'],
            },
          },
        });

        parsed = JSON.parse(response.text || '{}');
      } catch (geminiErr: any) {
        console.warn('Gemini adaptation fallback triggered:', geminiErr?.message || geminiErr);
      }
    }

    if (!parsed) {
      parsed = {
        identifiedGaps: isStruggling
          ? weakConcepts.length > 0
            ? weakConcepts
            : [`Core fundamentals in ${topicTitle}`]
          : [`Edge-case scenarios and advanced optimizations`],
        actionsTaken: isStruggling
          ? [
              `Injected targeted remedial module: "Reinforcement Focus on ${topicTitle}"`,
              `Added 2 buffer study hours for mastery`,
              `Curated interactive documentation and sandbox drills`,
            ]
          : [
              `Mastery verified (${score}% score achieved)`,
              `Unlocked recommended fast-track practical challenge`,
              `Accelerated next phase milestone by 3 calendar days`,
            ],
        encouragement: isStruggling
          ? `Gaps are the natural stepping stones of deep learning. We recalibrated your roadmap with a focused booster module so you build unshakable confidence before moving forward.`
          : `Tremendous work! Your score of ${score}% proves solid retention. You are ready to accelerate to the next technical challenge.`,
        remedialTopics: isStruggling
          ? [
              {
                title: `Remedial Drill: ${topicTitle} First Principles`,
                description: `Targeted review addressing missed concepts in ${weakConcepts.join(', ') || topicTitle}. Focuses on mental models, code snippets, and error patterns.`,
                estimatedHours: 2,
                keyOutcomes: [
                  `Resolve core misconceptions around ${weakConcepts[0] || topicTitle}`,
                  `Complete 3 guided self-check exercises`,
                  `Solidify intuition with visual architectural walkthroughs`,
                ],
                resources: [
                  {
                    title: `Interactive Drill Sandbox for ${topicTitle}`,
                    type: 'interactive',
                    urlOrSearch: `https://duckduckgo.com/?q=${encodeURIComponent(topicTitle + ' tutorial visual guide')}`,
                    free: true,
                    description: `Targeted interactive learning sandbox.`,
                  },
                ],
              },
            ]
          : [],
      };
    }

    // Create adaptation record
    const adaptationRecord = {
      id: `adapt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      triggerReason: `Quiz on "${topicTitle}" resulted in ${score}% score`,
      quizTopic: topicTitle,
      score,
      identifiedGaps: parsed.identifiedGaps || [],
      actionsTaken: parsed.actionsTaken || [],
      newTopicsAdded: (parsed.remedialTopics || []).map((t: any) => t.title),
      encouragement: parsed.encouragement || 'Keep pushing forward! Consistent practice turns challenges into mastery.',
    };

    const hydratedNewTopics = (parsed.remedialTopics || []).map((t: any, idx: number) => ({
      ...t,
      id: `remedial_${Date.now()}_${idx}`,
      isCompleted: false,
      isRemedialAdded: true,
    }));

    // If roadmapId exists, update stored roadmap
    if (roadmapId) {
      const roadmaps = loadSavedRoadmaps();
      const rIdx = roadmaps.findIndex((r) => r.id === roadmapId);
      if (rIdx >= 0) {
        const rm = roadmaps[rIdx];
        rm.adaptations = rm.adaptations || [];
        rm.adaptations.unshift(adaptationRecord);

        // Record quiz history
        rm.quizHistory = rm.quizHistory || [];
        rm.quizHistory.unshift({
          id: `qr_${Date.now()}`,
          roadmapId,
          phaseId,
          topicTitle,
          date: new Date().toISOString(),
          score,
          totalQuestions: totalQuestions || 4,
          correctCount: Math.round(((totalQuestions || 4) * score) / 100),
          answers: answers || [],
          weakConcepts,
          masteredConcepts,
        });

        // If remedial topics were generated and phase exists, inject them
        if (hydratedNewTopics.length > 0 && phaseId) {
          const pIdx = rm.phases.findIndex((p: any) => p.id === phaseId);
          if (pIdx >= 0) {
            rm.phases[pIdx].topics = [...rm.phases[pIdx].topics, ...hydratedNewTopics];
            const extraHours = hydratedNewTopics.reduce((acc: number, cur: any) => acc + (cur.estimatedHours || 2), 0);
            rm.phases[pIdx].estimatedTotalHours = (rm.phases[pIdx].estimatedTotalHours || 0) + extraHours;
            rm.totalEstimatedHours = (rm.totalEstimatedHours || 0) + extraHours;
          }
        }

        saveRoadmaps(roadmaps);
      }
    }

    res.json({
      adaptationRecord,
      remedialTopics: hydratedNewTopics,
    });
  } catch (err: any) {
    console.warn('Adaptation fallback triggered:', err?.message || err);
    res.json({
      adaptationRecord: {
        id: `adapt_${Date.now()}`,
        timestamp: new Date().toISOString(),
        triggerReason: `Quiz completed with ${req.body.score || 80}%`,
        quizTopic: req.body.topicTitle || 'Competency Drill',
        score: req.body.score || 80,
        identifiedGaps: [],
        actionsTaken: ['Roadmap updated and calibrated'],
        newTopicsAdded: [],
        encouragement: 'Great job completing your diagnostic check!',
      },
      remedialTopics: [],
    });
  }
});

// POST Generate Detailed Project Guide
app.post('/api/project/generate-guide', async (req: Request, res: Response) => {
  try {
    const { projectTitle, skillsLearned = [], targetCareer } = req.body;

    if (!projectTitle) {
      res.status(400).json({ error: 'Project title is required' });
      return;
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are a staff engineer preparing a student for a career as a ${targetCareer || 'Engineer'}.
Generate a comprehensive, actionable project blueprint and execution guide for:
Project Title: "${projectTitle}"
Skills / Tech Stack: ${skillsLearned.join(', ')}

Provide:
1. Executive summary of what they will build and why it stands out on a resume.
2. Architecture overview (components, data flow).
3. Recommended free tools, APIs, and datasets.
4. Step-by-step implementation phases with concrete coding tasks.
5. Verification criteria & edge cases to test.
6. How to showcase this in GitHub and on a technical interview.

Return strict JSON adhering to schema.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                projectTitle: { type: Type.STRING },
                elevatorPitch: { type: Type.STRING },
                architecture: { type: Type.STRING },
                datasetsAndTools: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                milestones: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      keyTasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['stepNumber', 'title', 'description', 'keyTasks'],
                  },
                },
                interviewHighlights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['projectTitle', 'elevatorPitch', 'architecture', 'datasetsAndTools', 'milestones', 'interviewHighlights'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        res.json(parsed);
        return;
      } catch (geminiErr: any) {
        console.warn('Project guide Gemini fallback triggered:', geminiErr?.message || geminiErr);
      }
    }

    // Deterministic fallback blueprint
    res.json({
      projectTitle,
      elevatorPitch: `A production-grade portfolio project highlighting end-to-end engineering excellence in ${skillsLearned.join(', ') || 'modern architecture'}.`,
      architecture: `Layered service architecture: Clean Separation of Interface -> Service Orchestrator -> Persistent Storage -> Test Suite.`,
      datasetsAndTools: [
        'Open-source benchmark datasets / Hugging Face Datasets',
        'Docker containerization for reproducible deployment',
        'GitHub Actions for automated CI/CD unit testing',
      ],
      milestones: [
        {
          stepNumber: 1,
          title: 'Project Ingestion & Scaffold Setup',
          description: 'Initialize clean repository structure, linting rules, and configuration validation.',
          keyTasks: ['Initialize Git repository with pre-commit hooks', 'Setup strict config validation and secrets management'],
        },
        {
          stepNumber: 2,
          title: 'Core Domain Logic Implementation',
          description: 'Implement the primary processing routines and service models.',
          keyTasks: ['Implement core algorithms with unit test coverage', 'Add structured logging and performance profiling'],
        },
        {
          stepNumber: 3,
          title: 'API & Client Presentation Layer',
          description: 'Expose endpoints and build a polished interface.',
          keyTasks: ['Deploy interactive interface or clean RESTful endpoints', 'Instrument latency and error telemetry'],
        },
        {
          stepNumber: 4,
          title: 'Evaluation, Benchmarks & Documentation',
          description: 'Quantify performance and formulate an impactful portfolio presentation.',
          keyTasks: ['Write comprehensive README with architecture diagrams', 'Record demonstration walk-through for resume'],
        },
      ],
      interviewHighlights: [
        'Explain architectural trade-offs chosen over common alternatives.',
        'Discuss how edge cases and memory constraints were managed.',
        'Demonstrate measurable benchmark performance numbers.',
      ],
    });
  } catch (err: any) {
    console.error('Project guide generation error:', err);
    res.status(500).json({ error: 'Failed to generate project guide: ' + (err?.message || '') });
  }
});

// Vite Middleware Mounting (Dev vs Prod)
async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PathMind AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
