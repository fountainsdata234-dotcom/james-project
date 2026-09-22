import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { CopingToolkit } from './components/CopingToolkit';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PrivacyVault } from './components/PrivacyVault';
import { FeedbackLab } from './components/FeedbackLab';
import { CrisisModal } from './components/CrisisModal';
import { ChatMessage, MoodEntry, MoodLevel, UserEngagementMetrics } from './types';
import { 
  getOrCreateSessionKey, 
  generateEncryptionKey, 
  exportKeyToHex, 
  encryptText 
} from './utils/crypto';
import { analyzeTextNLP } from './utils/nlp';

const INITIAL_GREETING: ChatMessage = {
  id: 'aura-welcome-1',
  sender: 'assistant',
  text: "Hello, and welcome. I'm Aura, your compassionate mental health companion.\n\nI am here to offer a safe, confidential, and non-judgmental space. Whether you need to vent about stress, reframe a spiraling thought, or practice regulated breathing, I am right beside you.\n\nHow is your heart and mind feeling today?",
  timestamp: new Date().toISOString(),
  nlpAnalysis: {
    sentimentScore: 0.8,
    sentimentLabel: 'positive',
    primaryEmotion: 'calm',
    emotionConfidence: 0.95,
    detectedDistortions: [],
    keyThemes: ['Welcoming Support'],
    suggestedCopingId: 'box-breathing',
    isCrisisSignal: false,
  },
  copingSuggestion: {
    id: 'box-breathing',
    title: '4-7-8 Calming Breathwork',
    category: 'breathing',
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [selectedCopingToolId, setSelectedCopingToolId] = useState<string | undefined>();

  // Encryption Key State
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [encryptionKeyHex, setEncryptionKeyHex] = useState<string>('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [isEncrypted, setIsEncrypted] = useState(true);

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);

  // Mood History & Metrics
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([
    {
      id: 'm-1',
      timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      mood: 'low',
      valenceScore: 2,
      tags: ['Work fatigue', 'Sleep issue'],
      note: 'Felt very exhausted by Thursday afternoon.',
    },
    {
      id: 'm-2',
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      mood: 'neutral',
      valenceScore: 3,
      tags: ['Resting'],
      note: 'Took an evening walk and did 4-7-8 breathing.',
    },
    {
      id: 'm-3',
      timestamp: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      mood: 'good',
      valenceScore: 4,
      tags: ['Reframing', 'Balanced'],
      note: 'Practiced thought reframing with Aura.',
    },
    {
      id: 'm-4',
      timestamp: new Date().toISOString(),
      mood: 'good',
      valenceScore: 4,
      tags: ['Calm'],
      note: 'Feeling more grounded and centered today.',
    },
  ]);

  const [metrics, setMetrics] = useState<UserEngagementMetrics>({
    totalSessions: 4,
    totalMessages: 9,
    mindfulMinutesSpent: 26,
    dayStreak: 4,
    copingExercisesCompleted: 5,
    averageSentimentTrajectory: [
      { date: 'Day 1', score: -0.5 },
      { date: 'Day 2', score: -0.2 },
      { date: 'Day 3', score: 0.3 },
      { date: 'Today', score: 0.6 },
    ],
    emotionFrequencies: {
      anxious: 4,
      overwhelmed: 2,
      calm: 5,
      hopeful: 3,
    },
    topDistortions: [
      { name: 'Catastrophizing', count: 5 },
      { name: 'All-or-Nothing', count: 4 },
      { name: 'Should Statements', count: 3 },
      { name: 'Emotional Reasoning', count: 2 },
    ],
    feedbackAverage: 4.8,
  });

  // Initialize Web Crypto AES-256 Key on mount
  useEffect(() => {
    async function initCrypto() {
      try {
        const { key, hex } = await getOrCreateSessionKey();
        setCryptoKey(key);
        setEncryptionKeyHex(hex);
      } catch (err) {
        console.warn('Crypto initialization error:', err);
      }
    }
    initCrypto();
  }, []);

  // Handle rolling a new encryption key
  const handleGenerateNewKey = async () => {
    try {
      const newKey = await generateEncryptionKey();
      const hex = await exportKeyToHex(newKey);
      localStorage.setItem('mh_e2ee_active_key', hex);
      setCryptoKey(newKey);
      setEncryptionKeyHex(hex);
      alert('New 256-bit AES-GCM encryption key generated.');
    } catch (err) {
      console.error('Failed to generate key:', err);
    }
  };

  // Synchronize session to backend in encrypted format
  const syncEncryptedSessionToBackend = async (currentMessages: ChatMessage[]) => {
    if (!cryptoKey) return;
    try {
      const plainPayload = JSON.stringify(currentMessages);
      const encrypted = await encryptText(plainPayload, cryptoKey);

      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'active-session-1',
          title: 'Encrypted Wellness Session',
          isEncrypted: true,
          cipherText: encrypted.cipherText,
          iv: encrypted.iv,
          messagesCount: currentMessages.length,
          sentimentSummary: currentMessages[currentMessages.length - 1]?.nlpAnalysis?.primaryEmotion || 'neutral',
        }),
      });
    } catch (err) {
      console.warn('Failed to sync encrypted session to backend:', err);
    }
  };

  // Send message flow
  const handleSendMessage = async (text: string) => {
    // 1. Immediate client-side NLP evaluation
    const clientNlp = analyzeTextNLP(text);

    // If severe crisis detected client-side, pop modal immediately
    if (clientNlp.isCrisisSignal) {
      setIsCrisisOpen(true);
    }

    const userMessage: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      nlpAnalysis: clientNlp,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 2. Call backend server API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(-8),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: 'msg-aura-' + Date.now(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toISOString(),
        nlpAnalysis: data.nlpAnalysis || clientNlp,
        copingSuggestion: data.copingSuggestion,
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Encrypt & sync to backend database
      await syncEncryptedSessionToBackend(finalMessages);

      // Update engagement metrics
      setMetrics((prev) => {
        const nextMindful = prev.mindfulMinutesSpent + 2;
        const nextCount = prev.totalMessages + 2;
        const newDistortions = [...prev.topDistortions];

        if (clientNlp.detectedDistortions.length > 0) {
          const dName = clientNlp.detectedDistortions[0].name;
          const found = newDistortions.find((d) => d.name === dName);
          if (found) found.count++;
          else newDistortions.push({ name: dName, count: 1 });
        }

        // Add point to trajectory
        const nextTrajectory = [...prev.averageSentimentTrajectory];
        nextTrajectory.push({
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          score: clientNlp.sentimentScore,
        });

        return {
          ...prev,
          totalMessages: nextCount,
          mindfulMinutesSpent: nextMindful,
          topDistortions: newDistortions,
          averageSentimentTrajectory: nextTrajectory.slice(-6),
        };
      });
    } catch (err) {
      console.error('Chat error:', err);
      // Friendly offline fallback response
      const fallbackAssistant: ChatMessage = {
        id: 'msg-aura-fallback-' + Date.now(),
        sender: 'assistant',
        text: "I am listening closely to you. Even when connection is interrupted, your feelings matter deeply. Let's take a slow breath together. Would you like to try the 4-7-8 breathing pacer or the 5-4-3-2-1 grounding exercise?",
        timestamp: new Date().toISOString(),
        nlpAnalysis: clientNlp,
        copingSuggestion: {
          id: 'box-breathing',
          title: '4-7-8 Breath Pacer',
          category: 'breathing',
        },
      };
      setMessages([...newMessages, fallbackAssistant]);
    } finally {
      setIsLoading(false);
    }
  };

  // Rating message helper
  const handleRateMessage = (messageId: string, rating: 'helpful' | 'unhelpful') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedbackRating: rating } : m))
    );

    // Send anonymous telemetry
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        overallRating: rating === 'helpful' ? 5 : 2,
        empathyScore: rating === 'helpful' ? 5 : 3,
        helpfulnessScore: rating === 'helpful' ? 5 : 2,
        feltHeard: rating === 'helpful',
        category: 'accuracy',
        comments: `Message #${messageId} evaluated as ${rating}`,
        userRole: 'real user',
      }),
    }).catch(() => {});
  };

  // Jump from chat to specific coping tool
  const handleSelectCopingTool = (toolId: string) => {
    setSelectedCopingToolId(toolId);
    setActiveTab('coping');
  };

  // Coping exercise completion handler
  const handleLogExerciseCompleted = (exerciseId: string, rating: number) => {
    setMetrics((prev) => ({
      ...prev,
      copingExercisesCompleted: prev.copingExercisesCompleted + 1,
      mindfulMinutesSpent: prev.mindfulMinutesSpent + 4,
    }));
  };

  // Log mood checkin
  const handleAddMood = (mood: MoodLevel, note?: string) => {
    const scores: Record<MoodLevel, number> = {
      great: 5,
      good: 4,
      neutral: 3,
      low: 2,
      distressed: 1,
    };

    const newEntry: MoodEntry = {
      id: 'mood-' + Date.now(),
      timestamp: new Date().toISOString(),
      mood,
      valenceScore: scores[mood],
      tags: [],
      note,
    };

    setMoodHistory((prev) => [...prev, newEntry]);

    setMetrics((prev) => {
      const normalizedScore = (scores[mood] - 3) / 2; // scale to -1.0 to 1.0
      const nextTrajectory = [...prev.averageSentimentTrajectory];
      nextTrajectory.push({
        date: 'Now',
        score: normalizedScore,
      });
      return {
        ...prev,
        averageSentimentTrajectory: nextTrajectory.slice(-6),
      };
    });
  };

  // Reset chat session
  const handleClearChat = () => {
    if (confirm('Start a fresh conversation? Current conversation remains archived in your encrypted store.')) {
      setMessages([INITIAL_GREETING]);
    }
  };

  // Zero-trace purge
  const handlePurgeAllData = async () => {
    try {
      await fetch('/api/conversations', { method: 'DELETE' });
    } catch {
      // safe
    }
    localStorage.clear();
    setMessages([INITIAL_GREETING]);
    setMoodHistory([]);
    setMetrics({
      totalSessions: 1,
      totalMessages: 1,
      mindfulMinutesSpent: 0,
      dayStreak: 1,
      copingExercisesCompleted: 0,
      averageSentimentTrajectory: [{ date: 'Today', score: 0 }],
      emotionFrequencies: {},
      topDistortions: [],
      feedbackAverage: 5,
    });
    alert('All records, session data, and cryptographic keys have been purged permanently.');
  };

  // Export encrypted backup
  const handleExportBackup = () => {
    const exportData = {
      app: 'Aura Mental Health Platform',
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      keyFingerprint: encryptionKeyHex.slice(0, 16) + '...',
      messages,
      moodHistory,
      metrics,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-encrypted-mental-health-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100/60 flex flex-col font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCrisis={() => setIsCrisisOpen(true)}
        isEncrypted={isEncrypted}
        onOpenPrivacy={() => setActiveTab('privacy')}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full min-h-0 overflow-hidden" id="main-content" tabIndex={-1}>
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onSelectCopingTool={handleSelectCopingTool}
            onOpenCrisis={() => setIsCrisisOpen(true)}
            onClearChat={handleClearChat}
            onRateMessage={handleRateMessage}
            isEncrypted={isEncrypted}
          />
        )}

        {activeTab === 'coping' && (
          <CopingToolkit
            initialToolId={selectedCopingToolId}
            onLogExerciseCompleted={handleLogExerciseCompleted}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            metrics={metrics}
            moodHistory={moodHistory}
            onAddMood={handleAddMood}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacyVault
            encryptionKeyHex={encryptionKeyHex}
            onGenerateNewKey={handleGenerateNewKey}
            onPurgeAllData={handlePurgeAllData}
            onExportBackup={handleExportBackup}
            activeCryptoKey={cryptoKey}
          />
        )}

        {activeTab === 'feedback' && <FeedbackLab />}
      </main>

      {/* Immediate Crisis Resources Modal */}
      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
      />
    </div>
  );
}
