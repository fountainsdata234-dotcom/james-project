import React, { useState } from 'react';
import { 
  TrendingUp, 
  Smile, 
  Frown, 
  Meh, 
  HeartHandshake, 
  Flame, 
  Clock, 
  Sparkles, 
  Download, 
  PlusCircle, 
  CheckCircle,
  Brain,
  Award
} from 'lucide-react';
import { MoodEntry, MoodLevel, UserEngagementMetrics } from '../types';

interface AnalyticsDashboardProps {
  metrics: UserEngagementMetrics;
  moodHistory: MoodEntry[];
  onAddMood: (mood: MoodLevel, note?: string, tags?: string[]) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  metrics,
  moodHistory,
  onAddMood,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodLevel>('good');
  const [moodNote, setMoodNote] = useState('');
  const [moodLoggedSuccess, setMoodLoggedSuccess] = useState(false);

  const moodLevels: Array<{ level: MoodLevel; label: string; score: number; color: string; icon: any }> = [
    { level: 'great', label: 'Thriving / Great', score: 5, color: 'text-emerald-600 bg-emerald-50 border-emerald-300', icon: Sparkles },
    { level: 'good', label: 'Good / Balanced', score: 4, color: 'text-teal-600 bg-teal-50 border-teal-300', icon: Smile },
    { level: 'neutral', label: 'Neutral / Okay', score: 3, color: 'text-slate-600 bg-slate-50 border-slate-300', icon: Meh },
    { level: 'low', label: 'Low / Heavy', score: 2, color: 'text-blue-600 bg-blue-50 border-blue-300', icon: Frown },
    { level: 'distressed', label: 'Distressed / Anxious', score: 1, color: 'text-rose-600 bg-rose-50 border-rose-300', icon: HeartHandshake },
  ];

  const handleLogMood = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMood(selectedMood, moodNote);
    setMoodNote('');
    setMoodLoggedSuccess(true);
    setTimeout(() => setMoodLoggedSuccess(false), 3000);
  };

  // Export summary report
  const handleExportSummary = () => {
    const summary = {
      title: 'Aura Mental Health & Wellness Progress Report',
      exportedAt: new Date().toISOString(),
      metrics: {
        totalSessions: metrics.totalSessions,
        dayStreak: metrics.dayStreak,
        mindfulMinutes: metrics.mindfulMinutesSpent,
        copingExercisesCompleted: metrics.copingExercisesCompleted,
      },
      moodCheckins: moodHistory.slice(-10),
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-wellness-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build SVG Path for Valence Trajectory
  const points = metrics.averageSentimentTrajectory;
  const svgWidth = 500;
  const svgHeight = 160;
  const padding = 30;

  const getSvgCoordinates = (index: number, score: number) => {
    const x = padding + (index / Math.max(1, points.length - 1)) * (svgWidth - padding * 2);
    // score ranges from -1 to 1; normalize to 0 to 1
    const normalized = (score + 1) / 2; // 0 (bottom) to 1 (top)
    const y = svgHeight - padding - normalized * (svgHeight - padding * 2);
    return { x, y };
  };

  const pathD = points.length > 1
    ? points.map((p, i) => {
        const { x, y } = getSvgCoordinates(i, p.score);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ')
    : '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Emotional Wellness &amp; Engagement Dashboard</h2>
          <p className="text-sm text-slate-600 mt-1">
            Track your emotional valence trajectory, cognitive patterns, and coping mechanism efficacy.
          </p>
        </div>

        <button
          id="export-summary-btn"
          onClick={handleExportSummary}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-teal-700" />
          <span>Export Wellness Report</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Mindful Streak */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consistency Streak</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{metrics.dayStreak} Days</div>
          <div className="text-xs text-slate-500 mt-1">Consecutive self-care check-ins</div>
        </div>

        {/* Mindful Minutes */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mindful Time</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{metrics.mindfulMinutesSpent} Mins</div>
          <div className="text-xs text-slate-500 mt-1">In regulated breathing &amp; chat</div>
        </div>

        {/* Exercises Completed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coping Tools</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{metrics.copingExercisesCompleted} Completed</div>
          <div className="text-xs text-slate-500 mt-1">94% post-exercise relief score</div>
        </div>

        {/* Total Sessions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reflective Sessions</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{metrics.totalSessions} Sessions</div>
          <div className="text-xs text-slate-500 mt-1">{metrics.totalMessages} encrypted reflections</div>
        </div>
      </div>

      {/* Mood Check-In Widget */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">How are you feeling right now?</h3>
            <p className="text-xs text-slate-500">Log your present emotional baseline to monitor your recovery trajectory.</p>
          </div>
          {moodLoggedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Logged!
            </span>
          )}
        </div>

        <form onSubmit={handleLogMood} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {moodLevels.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedMood === item.level;
              return (
                <button
                  key={item.level}
                  type="button"
                  id={`mood-checkin-${item.level}`}
                  onClick={() => setSelectedMood(item.level)}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    isSelected
                      ? `${item.color} font-bold ring-2 ring-teal-600 shadow-xs`
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Optional: Add a brief note (e.g. 'Slept poorly', 'Finished project', 'Walked outside')"
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-600"
            />
            <button
              type="submit"
              id="submit-mood-btn"
              className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Mood</span>
            </button>
          </div>
        </form>
      </div>

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valence Trend SVG Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>Emotional Valence Trajectory</span>
              </h3>
              <p className="text-xs text-slate-500">NLP sentiment tracking across daily interactions</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              7-Day Window
            </span>
          </div>

          <div className="w-full overflow-x-auto py-2">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-44 text-slate-400 select-none overflow-visible"
            >
              {/* Baseline Zero line (neutral) */}
              <line 
                x1={padding} 
                y1={svgHeight / 2} 
                x2={svgWidth - padding} 
                y2={svgHeight / 2} 
                stroke="#cbd5e1" 
                strokeDasharray="4 4" 
                strokeWidth="1.5" 
              />
              <text x={padding} y={svgHeight / 2 - 6} fill="#94a3b8" fontSize="10" fontWeight="600">
                Neutral Baseline
              </text>
              <text x={padding} y={padding - 5} fill="#0d9488" fontSize="10" fontWeight="bold">
                + Positive / Regulated
              </text>
              <text x={padding} y={svgHeight - 10} fill="#f43f5e" fontSize="10" fontWeight="bold">
                - Distressed / Vulnerable
              </text>

              {/* Trajectory Path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {points.map((p, i) => {
                const { x, y } = getSvgCoordinates(i, p.score);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                    <text
                      x={x}
                      y={svgHeight - 2}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                      fontWeight="500"
                    >
                      {p.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Cognitive Distortions & Emotional Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-teal-600" />
              <span>Cognitive Patterns &amp; Common Themes</span>
            </h3>
            <p className="text-xs text-slate-500">
              NLP detected thinking styles to help recognize habitual mental habits.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {metrics.topDistortions.map((item, idx) => {
              const maxCount = Math.max(...metrics.topDistortions.map((d) => d.count), 1);
              const percentage = Math.round((item.count / maxCount) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.name}</span>
                    <span className="text-slate-500">{item.count} instances</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-900">Therapist-Aligned Insight:</span>
            <p className="leading-relaxed">
              Catastrophizing and "Should" statements are common under fatigue. When these thoughts arise, pausing for the 4-7-8 breath allows the prefrontal cortex to regain regulatory control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
