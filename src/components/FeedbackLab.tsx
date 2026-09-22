import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Star, 
  MessageSquareHeart, 
  CheckCircle, 
  Sparkles, 
  Send, 
  Users, 
  Award,
  ShieldCheck,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { UserFeedback } from '../types';

export const FeedbackLab: React.FC = () => {
  const [overallRating, setOverallRating] = useState(5);
  const [empathyScore, setEmpathyScore] = useState(5);
  const [helpfulnessScore, setHelpfulnessScore] = useState(5);
  const [feltHeard, setFeltHeard] = useState(true);
  const [category, setCategory] = useState<string>('empathy');
  const [comments, setComments] = useState('');
  const [userRole, setUserRole] = useState('real user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Aggregated metrics from backend
  const [feedbackMetrics, setFeedbackMetrics] = useState<{
    totalSubmissions: number;
    averageOverallRating: number;
    averageEmpathyScore: number;
    averageHelpfulnessScore: number;
    feltHeardPercentage: number;
  }>({
    totalSubmissions: 3,
    averageOverallRating: 4.7,
    averageEmpathyScore: 5.0,
    averageHelpfulnessScore: 4.7,
    feltHeardPercentage: 100,
  });

  const [recentFeedbacks, setRecentFeedbacks] = useState<UserFeedback[]>([]);

  const fetchFeedbackData = async () => {
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setFeedbackMetrics(data.metrics);
        if (data.recentFeedbacks) setRecentFeedbacks(data.recentFeedbacks);
      }
    } catch (err) {
      console.warn('Failed to load feedback metrics from server:', err);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallRating,
          empathyScore,
          helpfulnessScore,
          feltHeard,
          category,
          comments,
          userRole,
        }),
      });

      if (res.ok) {
        setSubmittedSuccess(true);
        setComments('');
        await fetchFeedbackData();
        setTimeout(() => setSubmittedSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Real-User Testing &amp; Feedback Lab</h2>
        <p className="text-sm text-slate-600 mt-1">
          Evaluating the chatbot with real users to ensure conversational empathy, psychological safety, and evidence-based clinical validity.
        </p>
      </div>

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Rating</span>
          <div className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-1.5">
            <span>{feedbackMetrics.averageOverallRating}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-xs text-slate-500 mt-1">Scale of 1.0 to 5.0</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Empathy Index</span>
          <div className="text-2xl font-black text-teal-700 mt-2 flex items-center gap-1.5">
            <span>{feedbackMetrics.averageEmpathyScore}</span>
            <span className="text-sm font-bold text-slate-400">/ 5.0</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Non-judgmental warmth</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Felt Heard &amp; Safe</span>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {feedbackMetrics.feltHeardPercentage}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Positive emotional validation</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluations</span>
          <div className="text-2xl font-black text-indigo-700 mt-2">
            {feedbackMetrics.totalSubmissions}
          </div>
          <div className="text-xs text-slate-500 mt-1">Real-user submissions</div>
        </div>
      </div>

      {/* Main Feedback Submission Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              <span>Submit Your User Experience Evaluation</span>
            </h3>
            <p className="text-xs text-slate-500">
              Your confidential feedback directly informs prompt refinements and crisis detection accuracy.
            </p>
          </div>

          {submittedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Feedback Logged!
            </span>
          )}
        </div>

        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          {/* Ratings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <label className="text-xs font-bold text-slate-900 block">Overall Experience:</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOverallRating(star)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${star <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Empathy */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <label className="text-xs font-bold text-slate-900 block">Empathy &amp; Compassion:</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEmpathyScore(star)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${star <= empathyScore ? 'fill-teal-600 text-teal-600' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Helpfulness */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <label className="text-xs font-bold text-slate-900 block">Coping Tool Helpfulness:</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setHelpfulnessScore(star)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${star <= helpfulnessScore ? 'fill-indigo-600 text-indigo-600' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Validation Question & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1.5">
                Did you feel heard and respected?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFeltHeard(true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    feltHeard ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 'bg-white text-slate-600'
                  }`}
                >
                  Yes, Validated
                </button>
                <button
                  type="button"
                  onClick={() => setFeltHeard(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    !feltHeard ? 'bg-rose-50 border-rose-600 text-rose-900' : 'bg-white text-slate-600'
                  }`}
                >
                  No, Felt Disconnected
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1.5">
                Feedback Focus Area:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="empathy">Conversational Empathy &amp; Tone</option>
                <option value="accuracy">NLP Cognitive Distortion Accuracy</option>
                <option value="coping">Coping Tool &amp; Breathwork Efficacy</option>
                <option value="safety">Safety Disclaimers &amp; Crisis Routing</option>
                <option value="usability">Mobile &amp; Desktop Usability</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1.5">
                Your Evaluator Role:
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="real user">Real User / Individual Seeking Support</option>
                <option value="peer tester">Peer Mental Health Advocate</option>
                <option value="clinician">Psychologist / Clinical Evaluator</option>
                <option value="developer">NLP / Software Researcher</option>
              </select>
            </div>
          </div>

          {/* Comments Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 block">
              Detailed Feedback &amp; Suggestions for Improvement:
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What felt comforting? Did any phrasing feel unhelpful? How can Aura support you better?"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !comments.trim()}
              className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording Feedback...' : 'Submit Evaluation'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Real-User Review Wall */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent User Testing Submissions</h3>
            <p className="text-xs text-slate-500">Anonymous feedback collected during ongoing clinical and usability evaluations.</p>
          </div>
          <button
            onClick={fetchFeedbackData}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            title="Refresh feedback submissions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentFeedbacks.map((fb) => (
            <div key={fb.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= fb.overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {fb.category}
                </span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed italic">
                "{fb.comments}"
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span className="capitalize">{fb.userRole || 'Real User'}</span>
                <span>{new Date(fb.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
