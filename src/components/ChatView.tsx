import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  ThumbsDown, 
  Heart, 
  BrainCircuit, 
  AlertTriangle, 
  ArrowRight,
  Info
} from 'lucide-react';
import { ChatMessage, EmotionalTone } from '../types';
import { analyzeTextNLP } from '../utils/nlp';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onSelectCopingTool: (toolId: string) => void;
  onOpenCrisis: () => void;
  onClearChat: () => void;
  onRateMessage: (messageId: string, rating: 'helpful' | 'unhelpful') => void;
  isEncrypted: boolean;
}

const STARTER_PROMPTS = [
  { text: "I'm feeling a wave of anxiety right now and can't focus.", label: "Anxiety Spike" },
  { text: "I feel like a complete failure because I made a mistake today.", label: "Negative Self-Talk" },
  { text: "I am overwhelmed with too many tasks and feel paralyzed.", label: "Overwhelmed" },
  { text: "Can you guide me through a calming breathing exercise?", label: "Quick Breathwork" },
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onSelectCopingTool,
  onOpenCrisis,
  onClearChat,
  onRateMessage,
  isEncrypted,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Real-time NLP draft analysis as user types or speaks
  const combinedDraftText = inputText + (interimTranscript ? ` ${interimTranscript}` : '');
  const liveNlp = combinedDraftText.trim().length > 6 ? analyzeTextNLP(combinedDraftText) : null;

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  // Speech Recognition voice-to-text handler
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or type your message.');
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setInterimTranscript('');
      return;
    }

    setSpeechError(null);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTrans += transcript;
          } else {
            interimTrans += transcript;
          }
        }

        if (finalTrans) {
          setInputText((prev) => (prev ? `${prev.trim()} ${finalTrans.trim()}` : finalTrans.trim()));
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimTrans);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          // Normal timeout if user was silent
          return;
        } else if (event.error === 'network') {
          setSpeechError('Network error during speech recognition. Please check your internet connection.');
        } else {
          setSpeechError(`Speech recognition: ${event.error}`);
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition exception:', err);
      setSpeechError('Unable to start speech recognition. Please verify microphone access.');
      setIsListening(false);
      setInterimTranscript('');
    }
  };

  // Text to Speech playback
  const handleSpeak = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // slightly slower, calming pace
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText.trim();
    setInputText('');
    await onSendMessage(textToSend);
  };

  const getEmotionBadgeColor = (emotion?: EmotionalTone) => {
    switch (emotion) {
      case 'anxious':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'overwhelmed':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'sad':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'frustrated':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'calm':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'hopeful':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'reflective':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto min-h-0 h-[calc(100dvh-4.75rem)] sm:h-[calc(100dvh-4.25rem)] bg-slate-50/60">
      {/* Top Context Subheader */}
      <div className="bg-white px-3 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate">Empathetic Mental Health Support</h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium ml-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {isEncrypted ? 'End-to-End Encrypted' : 'Standard Session'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="clear-chat-history-btn"
            onClick={onClearChat}
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            title="Start a fresh conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-teal-50/80 border-b border-teal-100 px-3 py-2 sm:px-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] sm:text-xs text-teal-900">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <span>Aura is an AI peer-support tool. If in acute crisis or experiencing thoughts of harm, please dial <strong>988</strong> immediately.</span>
        </div>
        <button
          id="chat-top-crisis-link"
          onClick={onOpenCrisis}
          className="text-teal-800 font-bold underline hover:text-teal-950 whitespace-nowrap self-start sm:self-auto"
        >
          Crisis Resources
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div 
        id="chat-messages-container"
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5"
        role="log"
        aria-live="polite"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const hasDistortion = msg.nlpAnalysis?.detectedDistortions && msg.nlpAnalysis.detectedDistortions.length > 0;

          return (
            <div
              key={msg.id}
              id={`chat-message-${msg.id}`}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              {/* Sender & Timestamp Header */}
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-xs font-semibold text-slate-600">
                  {isUser ? 'You' : 'Aura (Companion)'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.nlpAnalysis?.primaryEmotion && !isUser && (
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getEmotionBadgeColor(msg.nlpAnalysis.primaryEmotion)}`}>
                    {msg.nlpAnalysis.primaryEmotion}
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[92%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 shadow-2xs leading-relaxed text-sm ${
                  isUser
                    ? 'bg-teal-700 text-white rounded-tr-xs'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Assistant Coping Suggestion Card */}
                {!isUser && msg.copingSuggestion && (
                  <div className="mt-3 p-3 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-950 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-teal-600 text-white shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-teal-900">Recommended Exercise:</div>
                        <div className="text-xs font-medium text-teal-800">{msg.copingSuggestion.title}</div>
                      </div>
                    </div>
                    <button
                      id={`start-suggested-tool-${msg.id}`}
                      onClick={() => onSelectCopingTool(msg.copingSuggestion!.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors shrink-0 shadow-2xs"
                    >
                      <span>Try Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Assistant Detected Distortion Reframing Card */}
                {!isUser && hasDistortion && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <BrainCircuit className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>NLP Cognitive Pattern Identified:</span>
                      <span className="font-semibold underline">
                        {msg.nlpAnalysis!.detectedDistortions[0].name}
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/90 leading-normal">
                      {msg.nlpAnalysis!.detectedDistortions[0].reframingTip}
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={() => onSelectCopingTool('cbt-reframer')}
                        className="text-xs font-bold text-amber-800 hover:text-amber-950 underline inline-flex items-center gap-1"
                      >
                        Launch Interactive CBT Reframer <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Controls (Audio Readout & Rating) */}
              {!isUser && (
                <div className="flex items-center gap-2 mt-1.5 px-2">
                  <button
                    id={`tts-btn-${msg.id}`}
                    onClick={() => handleSpeak(msg.id, msg.text)}
                    className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
                    title={speakingMessageId === msg.id ? 'Stop readout' : 'Listen to message (Text-to-speech)'}
                    aria-label="Text to speech readout"
                  >
                    {speakingMessageId === msg.id ? (
                      <VolumeX className="w-3.5 h-3.5 text-teal-600" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <span className="text-slate-300">|</span>

                  <span className="text-[11px] text-slate-500 font-medium">Was this response helpful?</span>
                  
                  <button
                    id={`feedback-helpful-${msg.id}`}
                    onClick={() => onRateMessage(msg.id, 'helpful')}
                    className={`p-1 rounded transition-colors ${
                      msg.feedbackRating === 'helpful'
                        ? 'text-teal-700 bg-teal-50'
                        : 'text-slate-400 hover:text-teal-700'
                    }`}
                    title="Helpful response"
                    aria-label="Rate response as helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`feedback-unhelpful-${msg.id}`}
                    onClick={() => onRateMessage(msg.id, 'unhelpful')}
                    className={`p-1 rounded transition-colors ${
                      msg.feedbackRating === 'unhelpful'
                        ? 'text-rose-600 bg-rose-50'
                        : 'text-slate-400 hover:text-rose-600'
                    }`}
                    title="Needs improvement"
                    aria-label="Rate response as unhelpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-xs font-semibold text-slate-600">Aura is reflecting</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-2xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-xs text-slate-500 ml-2">Analyzing emotional tone &amp; formulating support...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div className="px-3 py-2 border-t border-slate-200/60 bg-white/70 sm:px-4">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Suggested Conversation Starters:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((starter, idx) => (
              <button
                key={idx}
                id={`starter-chip-${idx}`}
                onClick={() => onSendMessage(starter.text)}
                className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 border border-slate-200 text-slate-700 transition-all text-left"
              >
                {starter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Speech Recognition Active Banner or Error Alert */}
      {speechError && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-rose-700 hover:text-rose-900 font-bold ml-2 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {isListening && (
        <div className="px-4 py-2 bg-teal-50 border-t border-teal-200 text-xs text-teal-900 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="font-semibold">Listening to your voice... Speak freely.</span>
            {interimTranscript && (
              <span className="italic text-teal-700 max-w-xs truncate border-l border-teal-200 pl-2">
                "{interimTranscript}"
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleVoiceInput}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-colors"
          >
            Stop Listening
          </button>
        </div>
      )}

      {/* Live NLP Sentiment Indicator Preview (when typing or speaking) */}
      {liveNlp && (
        <div className="px-4 py-1.5 bg-slate-100/90 border-t border-slate-200 text-xs flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-3.5 h-3.5 text-teal-600" />
            <span>Detected Tone: <strong className="capitalize text-slate-900">{liveNlp.primaryEmotion}</strong></span>
            {liveNlp.detectedDistortions.length > 0 && (
              <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] font-medium">
                Distortion: {liveNlp.detectedDistortions[0].name}
              </span>
            )}
          </div>
          {liveNlp.isCrisisSignal && (
            <span className="text-rose-700 font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> High Urgency Safety Alert
            </span>
          )}
        </div>
      )}

      {/* Message Input Form */}
      <div className="p-3 bg-white border-t border-slate-200 sm:p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Voice Input Button */}
          <button
            type="button"
            id="voice-input-btn"
            onClick={handleVoiceInput}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all shrink-0 ${
              isListening
                ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-400/50 shadow-sm'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'
            }`}
            title={isListening ? 'Stop listening (SpeechRecognition active)' : 'Voice-to-Text: Click to speak your thoughts'}
            aria-label="Speech recognition voice input"
          >
            {isListening ? (
              <div className="relative">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-rose-600" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
              </div>
            ) : (
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Textarea Input */}
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={inputRef}
              id="chat-message-input"
              rows={1}
              value={inputText + (interimTranscript ? ` (${interimTranscript}...)` : '')}
              onChange={(e) => {
                // If user edits directly, update inputText
                setInputText(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={isListening ? "Listening... your spoken words will appear here" : "Share what is on your mind or click the microphone to speak... (Press Enter to send)"}
              className={`w-full resize-none rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[46px] max-h-32 transition-colors ${
                isListening
                  ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20'
                  : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
              }`}
              aria-label="Message text"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            id="send-message-btn"
            disabled={(!inputText.trim() && !interimTranscript.trim()) || isLoading}
            className="p-2.5 sm:p-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors shrink-0 shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>

        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-[10px] sm:text-[11px] text-slate-500 px-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Voice &amp; text encrypted locally • Confidential</span>
          </span>
          <span>Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
