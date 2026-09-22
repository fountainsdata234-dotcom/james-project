export type MoodLevel = 'great' | 'good' | 'neutral' | 'low' | 'distressed';

export type EmotionalTone = 
  | 'calm'
  | 'hopeful'
  | 'anxious'
  | 'overwhelmed'
  | 'sad'
  | 'frustrated'
  | 'reflective'
  | 'neutral';

export interface CognitiveDistortion {
  id: string;
  name: string;
  description: string;
  example: string;
  detectedQuote?: string;
  reframingTip: string;
}

export interface NLPAnalysisResult {
  sentimentScore: number; // -1.0 to 1.0
  sentimentLabel: 'positive' | 'neutral' | 'negative' | 'vulnerable';
  primaryEmotion: EmotionalTone;
  emotionConfidence: number; // 0.0 to 1.0
  detectedDistortions: CognitiveDistortion[];
  keyThemes: string[];
  suggestedCopingId?: string;
  isCrisisSignal: boolean;
  crisisUrgency?: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  encrypted?: boolean;
  nlpAnalysis?: NLPAnalysisResult;
  copingSuggestion?: {
    id: string;
    title: string;
    category: string;
  };
  feedbackRating?: 'helpful' | 'neutral' | 'unhelpful';
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  overallSentiment: number;
  tags: string[];
  isEncrypted: boolean;
  iv?: string; // Base64 IV if server-stored encrypted payload
  encryptedData?: string; // Ciphertext
}

export interface MoodEntry {
  id: string;
  timestamp: string;
  mood: MoodLevel;
  valenceScore: number; // 1 to 5
  tags: string[];
  note?: string;
}

export interface CopingExercise {
  id: string;
  title: string;
  category: 'breathing' | 'grounding' | 'cbt' | 'relaxation' | 'journaling';
  durationMinutes: number;
  description: string;
  efficacyRate: number; // e.g., 94%
  completedCount: number;
  averageRating?: number;
}

export interface UserFeedback {
  id: string;
  timestamp: string;
  overallRating: number; // 1 to 5
  empathyScore: number; // 1 to 5
  helpfulnessScore: number; // 1 to 5
  feltHeard: boolean;
  category: 'accuracy' | 'empathy' | 'usability' | 'safety' | 'general';
  comments: string;
  userRole?: string; // 'real user', 'clinician', 'peer tester'
}

export interface UserEngagementMetrics {
  totalSessions: number;
  totalMessages: number;
  mindfulMinutesSpent: number;
  dayStreak: number;
  copingExercisesCompleted: number;
  averageSentimentTrajectory: { date: string; score: number }[];
  emotionFrequencies: Record<string, number>;
  topDistortions: { name: string; count: number }[];
  feedbackAverage: number;
}
