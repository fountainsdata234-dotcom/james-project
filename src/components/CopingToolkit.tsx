import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, 
  Eye, 
  BrainCircuit, 
  Activity, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Star, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CopingToolkitProps {
  initialToolId?: string;
  onLogExerciseCompleted: (exerciseId: string, rating: number) => void;
}

type ToolMode = 'breathing' | 'grounding' | 'cbt' | 'pmr' | 'gratitude';

export const CopingToolkit: React.FC<CopingToolkitProps> = ({
  initialToolId,
  onLogExerciseCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<ToolMode>('breathing');

  useEffect(() => {
    if (initialToolId === 'cbt-reframer') setActiveTab('cbt');
    else if (initialToolId === 'sensory-grounding') setActiveTab('grounding');
    else if (initialToolId === 'box-breathing') setActiveTab('breathing');
  }, [initialToolId]);

  // -------------------------------------------------------------
  // 1. BREATHING PACER ENGINE (4-7-8 & Box Breathing)
  // -------------------------------------------------------------
  const [breathingTechnique, setBreathingTechnique] = useState<'478' | 'box'>('478');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [audioChime, setAudioChime] = useState(true);

  // Audio synthesizer tone for breathing transitions
  const playTone = (freq: number) => {
    if (!audioChime || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch {
      // AudioContext policy handled gracefully
    }
  };

  useEffect(() => {
    let timer: any = null;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setPhaseSecondsLeft((prev) => {
          if (prev > 1) return prev - 1;

          // Transition to next phase
          if (breathingTechnique === '478') {
            if (breathPhase === 'Inhale') {
              playTone(440); // A4
              setBreathPhase('Hold');
              return 7;
            } else if (breathPhase === 'Hold') {
              playTone(392); // G4
              setBreathPhase('Exhale');
              return 8;
            } else {
              playTone(523.25); // C5
              setBreathPhase('Inhale');
              setCompletedCycles((c) => {
                const next = c + 1;
                if (next === 4) {
                  confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                }
                return next;
              });
              return 4;
            }
          } else {
            // Box Breathing: 4 - 4 - 4 - 4
            if (breathPhase === 'Inhale') {
              playTone(440);
              setBreathPhase('Hold');
              return 4;
            } else if (breathPhase === 'Hold') {
              playTone(392);
              setBreathPhase('Exhale');
              return 4;
            } else if (breathPhase === 'Exhale') {
              playTone(349.23);
              setBreathPhase('Rest');
              return 4;
            } else {
              playTone(523.25);
              setBreathPhase('Inhale');
              setCompletedCycles((c) => c + 1);
              return 4;
            }
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase, breathingTechnique]);

  const resetBreathing = () => {
    setIsBreathingActive(false);
    setBreathPhase('Inhale');
    setPhaseSecondsLeft(4);
    setCompletedCycles(0);
  };

  // -------------------------------------------------------------
  // 2. 5-4-3-2-1 SENSORY GROUNDING
  // -------------------------------------------------------------
  const [groundingStep, setGroundingStep] = useState(1);
  const [groundingInputs, setGroundingInputs] = useState({
    see: ['', '', '', '', ''],
    feel: ['', '', '', ''],
    hear: ['', '', ''],
    smell: ['', ''],
    taste: [''],
  });

  const handleGroundingInput = (category: keyof typeof groundingInputs, idx: number, val: string) => {
    setGroundingInputs((prev) => {
      const arr = [...prev[category]];
      arr[idx] = val;
      return { ...prev, [category]: arr };
    });
  };

  // -------------------------------------------------------------
  // 3. CBT THOUGHT REFRAMER
  // -------------------------------------------------------------
  const [cbtStep, setCbtStep] = useState<1 | 2 | 3 | 4>(1);
  const [automaticThought, setAutomaticThought] = useState('');
  const [selectedDistortion, setSelectedDistortion] = useState('Catastrophizing');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [balancedThought, setBalancedThought] = useState('');
  const [cbtSubmitted, setCbtSubmitted] = useState(false);

  // -------------------------------------------------------------
  // 4. PROGRESSIVE MUSCLE RELAXATION
  // -------------------------------------------------------------
  const [pmrStep, setPmrStep] = useState(0);
  const pmrSteps = [
    { area: 'Forehead & Brow', action: 'Gently squeeze your eyebrows together for 5 seconds... now fully release all tension. Notice the smooth warmth spreading across your forehead.' },
    { area: 'Jaw & Teeth', action: 'Clench your jaw lightly for 5 seconds without straining... now release and let your mouth open slightly. Notice the relief in your jaw muscles.' },
    { area: 'Shoulders & Neck', action: 'Raise your shoulders high toward your ears for 5 seconds... exhale and drop your shoulders down completely. Let the gravity carry the weight away.' },
    { area: 'Hands & Arms', action: 'Make tight fists with both hands for 5 seconds... now open your palms wide and relax your fingers completely on your lap.' },
    { area: 'Stomach & Core', action: 'Tighten your abdominal muscles as if bracing for 5 seconds... now release and allow your belly to soften naturally on your next exhale.' },
    { area: 'Feet & Toes', action: 'Curl your toes downward toward the ground for 5 seconds... then release. Feel the sensation of calm grounding in your feet.' },
  ];

  // -------------------------------------------------------------
  // 5. POST-EXERCISE EVALUATION RATING
  // -------------------------------------------------------------
  const [exerciseRated, setExerciseRated] = useState(false);
  const [exerciseRating, setExerciseRating] = useState(5);

  const handleCompleteAndRate = (exerciseId: string) => {
    onLogExerciseCompleted(exerciseId, exerciseRating);
    setExerciseRated(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Coping Toolkit</h2>
        <p className="text-sm text-slate-600 mt-1">
          Clinically supported micro-interventions to regulate nervous system arousal and reframe unhelpful thinking.
        </p>
      </div>

      {/* Toolkit Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3" role="tablist">
        <button
          id="tab-breathing"
          onClick={() => { setActiveTab('breathing'); setExerciseRated(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'breathing'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Breathwork Pacer</span>
        </button>

        <button
          id="tab-grounding"
          onClick={() => { setActiveTab('grounding'); setExerciseRated(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'grounding'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>5-4-3-2-1 Sensory Grounding</span>
        </button>

        <button
          id="tab-cbt"
          onClick={() => { setActiveTab('cbt'); setExerciseRated(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'cbt'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>CBT Thought Reframer</span>
        </button>

        <button
          id="tab-pmr"
          onClick={() => { setActiveTab('pmr'); setExerciseRated(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'pmr'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Body Scan &amp; Relaxation</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. BREATHWORK PACER */}
      {activeTab === 'breathing' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {breathingTechnique === '478' ? '4-7-8 Relaxing Breath Pacer' : 'Box Breathing (4-4-4-4)'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {breathingTechnique === '478'
                  ? 'Stimulates the vagus nerve and activates the parasympathetic calming response.'
                  : 'Used by emergency responders to regain acute focus and lower physical heart rate.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                <button
                  id="switch-478-technique"
                  onClick={() => { setBreathingTechnique('478'); resetBreathing(); }}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    breathingTechnique === '478' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  4-7-8 Rhythm
                </button>
                <button
                  id="switch-box-technique"
                  onClick={() => { setBreathingTechnique('box'); resetBreathing(); }}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    breathingTechnique === 'box' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Box 4-4-4-4
                </button>
              </div>

              <button
                id="toggle-chime-btn"
                onClick={() => setAudioChime(!audioChime)}
                className={`p-2 rounded-lg border transition-colors ${
                  audioChime ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
                title={audioChime ? 'Sound chimes enabled' : 'Muted'}
                aria-label="Toggle breath chime audio"
              >
                {audioChime ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Breathing Orb Visualization */}
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Animated outer ring */}
              <div
                className={`absolute rounded-full transition-all duration-1000 ${
                  isBreathingActive
                    ? breathPhase === 'Inhale'
                      ? 'w-60 h-60 bg-teal-500/20 scale-100'
                      : breathPhase === 'Hold'
                      ? 'w-60 h-60 bg-indigo-500/20 scale-105'
                      : 'w-36 h-36 bg-emerald-500/20 scale-90'
                    : 'w-48 h-48 bg-slate-100'
                }`}
              />

              {/* Central Circle */}
              <div
                className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center text-center shadow-md transition-all duration-700 ${
                  isBreathingActive
                    ? breathPhase === 'Inhale'
                      ? 'bg-teal-600 text-white ring-8 ring-teal-100 scale-105'
                      : breathPhase === 'Hold'
                      ? 'bg-indigo-600 text-white ring-8 ring-indigo-100 scale-105'
                      : 'bg-emerald-600 text-white ring-8 ring-emerald-100 scale-95'
                    : 'bg-slate-800 text-white'
                }`}
              >
                <div className="text-xl font-black uppercase tracking-wider">
                  {isBreathingActive ? breathPhase : 'Ready'}
                </div>
                {isBreathingActive ? (
                  <div className="text-3xl font-extrabold mt-1">{phaseSecondsLeft}s</div>
                ) : (
                  <div className="text-xs text-slate-300 mt-1">Press Start below</div>
                )}
                <div className="text-[11px] opacity-80 mt-1">
                  Cycles: {completedCycles}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center gap-3">
              <button
                id="start-breathing-btn"
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm transition-all"
              >
                {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isBreathingActive ? 'Pause' : 'Start Guided Breath'}</span>
              </button>

              <button
                id="reset-breathing-btn"
                onClick={resetBreathing}
                className="p-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                title="Reset breath counter"
                aria-label="Reset breathing session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Completion Rating Block */}
          {completedCycles >= 2 && !exerciseRated && (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-teal-900">
                <strong>Well done!</strong> You finished {completedCycles} mindful cycles. How does your body feel now?
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setExerciseRating(star)}
                    className="p-1 text-teal-700 hover:scale-110 transition-transform"
                    aria-label={`${star} stars`}
                  >
                    <Star className={`w-4 h-4 ${star <= exerciseRating ? 'fill-teal-600 text-teal-600' : 'text-teal-300'}`} />
                  </button>
                ))}
                <button
                  onClick={() => handleCompleteAndRate('box-breathing')}
                  className="ml-2 px-3 py-1 bg-teal-700 text-white text-xs font-bold rounded-lg hover:bg-teal-800 transition-colors"
                >
                  Log Relief
                </button>
              </div>
            </div>
          )}

          {exerciseRated && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Exercise recorded to your wellness metrics. Great self-care dedication!</span>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. 5-4-3-2-1 SENSORY GROUNDING */}
      {activeTab === 'grounding' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">5-4-3-2-1 Sensory Grounding Technique</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Connect to the present physical room using all five senses to interrupt anxiety spirals.
            </p>
          </div>

          {/* Stepper Header */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold border-b border-slate-100 pb-3">
            {[
              { num: 5, label: 'See' },
              { num: 4, label: 'Touch' },
              { num: 3, label: 'Hear' },
              { num: 2, label: 'Smell' },
              { num: 1, label: 'Taste' },
            ].map((step, idx) => (
              <button
                key={idx}
                id={`grounding-step-tab-${step.num}`}
                onClick={() => setGroundingStep(idx + 1)}
                className={`p-2 rounded-lg transition-all ${
                  groundingStep === idx + 1
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 font-extrabold'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="text-base">{step.num}</div>
                <div>{step.label}</div>
              </button>
            ))}
          </div>

          {/* Active Grounding Category Inputs */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            {groundingStep === 1 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Name 5 things you can SEE around you right now:
                </h4>
                <p className="text-xs text-slate-600 mb-3">Notice colors, shadows, shapes, or small details in the room.</p>
                <div className="space-y-2">
                  {groundingInputs.see.map((val, i) => (
                    <input
                      key={i}
                      type="text"
                      value={val}
                      onChange={(e) => handleGroundingInput('see', i, e.target.value)}
                      placeholder={`Thing #${i + 1} you see (e.g. green plant leaf, window frame)`}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
                    />
                  ))}
                </div>
              </div>
            )}

            {groundingStep === 2 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Name 4 things you can physically TOUCH or FEEL:
                </h4>
                <p className="text-xs text-slate-600 mb-3">The texture of your shirt, the cool desk surface, the soles of your shoes.</p>
                <div className="space-y-2">
                  {groundingInputs.feel.map((val, i) => (
                    <input
                      key={i}
                      type="text"
                      value={val}
                      onChange={(e) => handleGroundingInput('feel', i, e.target.value)}
                      placeholder={`Thing #${i + 1} you feel (e.g. soft cotton sleeve, chair beneath me)`}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
                    />
                  ))}
                </div>
              </div>
            )}

            {groundingStep === 3 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Name 3 sounds you can HEAR:
                </h4>
                <p className="text-xs text-slate-600 mb-3">A distant car, computer fan, clock ticking, or your own breath.</p>
                <div className="space-y-2">
                  {groundingInputs.hear.map((val, i) => (
                    <input
                      key={i}
                      type="text"
                      value={val}
                      onChange={(e) => handleGroundingInput('hear', i, e.target.value)}
                      placeholder={`Sound #${i + 1} (e.g. gentle air conditioner, rustling paper)`}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
                    />
                  ))}
                </div>
              </div>
            )}

            {groundingStep === 4 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Name 2 things you can SMELL:
                </h4>
                <p className="text-xs text-slate-600 mb-3">Coffee, soap on your hands, fresh air, or clean laundry.</p>
                <div className="space-y-2">
                  {groundingInputs.smell.map((val, i) => (
                    <input
                      key={i}
                      type="text"
                      value={val}
                      onChange={(e) => handleGroundingInput('smell', i, e.target.value)}
                      placeholder={`Scent #${i + 1} (e.g. warm tea, hand lotion)`}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
                    />
                  ))}
                </div>
              </div>
            )}

            {groundingStep === 5 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Name 1 thing you can TASTE (or one positive affirmation):
                </h4>
                <p className="text-xs text-slate-600 mb-3">A sip of cool water, mint, or say: "I am safe and grounded in this room."</p>
                <input
                  type="text"
                  value={groundingInputs.taste[0]}
                  onChange={(e) => handleGroundingInput('taste', 0, e.target.value)}
                  placeholder="Taste or affirmation (e.g. Mint flavor / I am here and safe right now)"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-3">
              {groundingStep > 1 ? (
                <button
                  onClick={() => setGroundingStep((s) => s - 1)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Previous Step
                </button>
              ) : <div />}

              {groundingStep < 5 ? (
                <button
                  onClick={() => setGroundingStep((s) => s + 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition-colors"
                >
                  <span>Next Sense</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleCompleteAndRate('sensory-grounding')}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish &amp; Complete Grounding</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. CBT THOUGHT REFRAMER */}
      {activeTab === 'cbt' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">CBT Cognitive Distortion Reframer</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Break automatic negative thoughts down into objective evidence and compassionate balanced reframes.
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1: Automatic Thought */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-slate-900 block">
                1. What is the automatic thought bothering you?
              </label>
              <textarea
                rows={2}
                value={automaticThought}
                onChange={(e) => setAutomaticThought(e.target.value)}
                placeholder="e.g. 'I made a typo in my presentation, my boss thinks I am incompetent and I will get fired.'"
                className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              />
            </div>

            {/* Step 2: Select Distortion */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-slate-900 block">
                2. Which cognitive distortion is this thought using?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Catastrophizing',
                  'All-or-Nothing',
                  'Mind Reading',
                  'Emotional Reasoning',
                  'Should Statements',
                  'Overgeneralization',
                ].map((distortion) => (
                  <button
                    key={distortion}
                    type="button"
                    onClick={() => setSelectedDistortion(distortion)}
                    className={`p-2 rounded-lg text-xs font-semibold text-left border transition-all ${
                      selectedDistortion === distortion
                        ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {distortion}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Evidence Test */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-slate-900 block">
                3. What is factual evidence AGAINST this extreme conclusion?
              </label>
              <textarea
                rows={2}
                value={evidenceAgainst}
                onChange={(e) => setEvidenceAgainst(e.target.value)}
                placeholder="e.g. 'Everyone makes small mistakes. My boss praised my overall project work yesterday and has never threatened my job.'"
                className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              />
            </div>

            {/* Step 4: Balanced Reframe */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-slate-900 block">
                4. Write a balanced, compassionate replacement thought:
              </label>
              <textarea
                rows={2}
                value={balancedThought}
                onChange={(e) => setBalancedThought(e.target.value)}
                placeholder="e.g. 'One mistake does not define my worth or competence. I am human, I learned from it, and I am still capable.'"
                className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                id="save-cbt-reframer-btn"
                disabled={!automaticThought || !balancedThought}
                onClick={() => {
                  setCbtSubmitted(true);
                  handleCompleteAndRate('cbt-reframer');
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors inline-flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Balanced Reframe</span>
              </button>
            </div>

            {cbtSubmitted && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Cognitive Shift Saved:</span>
                </div>
                <p className="italic font-medium">"{balancedThought}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. PROGRESSIVE MUSCLE RELAXATION */}
      {activeTab === 'pmr' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Progressive Muscle Relaxation (PMR)</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Systematically tense and release muscle groups to discharge adrenaline and physical somatic stress.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-teal-50/60 border border-teal-100 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg">
              {pmrStep + 1}/{pmrSteps.length}
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-teal-800">Target Area:</span>
              <h4 className="text-xl font-bold text-slate-900 mt-0.5">{pmrSteps[pmrStep].area}</h4>
            </div>

            <p className="text-sm text-slate-700 max-w-lg leading-relaxed">
              {pmrSteps[pmrStep].action}
            </p>

            <div className="pt-4 flex items-center gap-3">
              {pmrStep > 0 && (
                <button
                  onClick={() => setPmrStep((s) => s - 1)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Previous Area
                </button>
              )}

              {pmrStep < pmrSteps.length - 1 ? (
                <button
                  onClick={() => setPmrStep((s) => s + 1)}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>Next Area</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleCompleteAndRate('body-scan')}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete PMR Routine</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
