
export enum ScreenName {
  WELCOME = 'WELCOME',
  STUDENT_INFO = 'STUDENT_INFO',
  ASSESSMENT = 'ASSESSMENT',
  ANALYSIS_RESULT = 'ANALYSIS_RESULT',
  CLASS_SELECTION = 'CLASS_SELECTION',
  LEARNING_PATH = 'LEARNING_PATH',
  QUIZ = 'QUIZ',
  QUIZ_RESULT = 'QUIZ_RESULT',
  PROFILE = 'PROFILE',
  PARENT_REPORT = 'PARENT_REPORT',
  CHAT = 'CHAT',
  GAMES = 'GAMES',
  SETTINGS = 'SETTINGS'
}

export interface NumerologyProfile {
  lifePathNumber: number;
  title: string;
  // 10 Key Fields
  overview: string;             // 1. TỔNG QUAN TÍNH CÁCH
  learningStyle: string;        // 2. PHONG CÁCH HỌC TẬP
  aptitude: string;             // 3. KHIẾU NĂNG LỰC TẬP TRUNG
  motivation: string;           // 4. ĐỘNG LỰC HỌC TẬP
  mathApproach: string;         // 5. CÁCH TIẾP CẬN BÀI TOÁN
  strengths: string[];          // 6. ĐIỂM MẠNH NỔI BẬT
  challenges: string[];         // 7. THÁCH THỨC CẦN KHẮC PHỤC
  effectiveMethod: string;      // 8. PHƯƠNG PHÁP HỌC HIỆU QUẢ
  environment: string;          // 9. MÔI TRƯỜNG HỌC TẬP LÝ TƯỞNG
  conclusion: string;           // 10. KẾT LUẬN KHUYẾN NGHỊ CHUNG
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-in-blank';

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[]; // For multiple-choice
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LearningUnit {
  id: string;
  topicId: string;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'completed';
  questions: Question[];
  totalXp: number;
  durationMinutes: number;
  level?: number; // 1: Basic, 2: Advanced, 3: Expert
}

export interface QuizResult {
  unitId: string;
  unitTitle?: string; // Added for history display
  score: number;
  totalQuestions: number;
  userAnswers: Record<string, string>; // questionId -> answer
  timeSpentSeconds: number;
  timestamp?: number; // Epoch time of completion
}

export interface GameActivity {
  id: string;
  type: 'game' | 'puzzle' | 'challenge';
  title: string;
  description: string;
  difficulty: 'Dễ' | 'Vừa' | 'Khó';
  duration: string;
  xpReward: number;
  interactiveContent: string; // The riddle question, game rules, or challenge steps
  answer?: string; // For puzzles
  hint?: string;
  funFact?: string; // A fun related fact to make it engaging
}

export interface UserProfile {
  name: string;
  dob: string;
  grade: number;
  numerologyNumber: number; 
  numerologyProfile?: NumerologyProfile;
  proficiencyLevel?: number; // 1: Weak, 2: Average, 3: Good, 4: Excellent
  assessmentTags?: string[]; // New: Habits like "Slow calculator", "Likes puzzles"
  assessmentNotes?: string;  // New: Custom notes from user
  selectedTopics?: string[];
  learningPath?: LearningUnit[];
  history?: QuizResult[]; // Store learning history
  currentGames?: GameActivity[]; // Persist current set of games
  completedGameIds?: string[]; // Track completed games
}