import { CognitiveDistortion, EmotionalTone, NLPAnalysisResult } from '../types';

/**
 * Client and Shared Natural Language Processing (NLP) Engine
 * Implements tokenization, cognitive distortion pattern matching,
 * sentiment polarity scoring, and crisis detection.
 */

// Common psychological cognitive distortion patterns
const DISTORTION_PATTERNS: Array<{
  id: string;
  name: string;
  description: string;
  example: string;
  regex: RegExp;
  reframingTip: string;
}> = [
  {
    id: 'all-or-nothing',
    name: 'All-or-Nothing Thinking',
    description: 'Viewing situations in polarized black-and-white categories without gray area.',
    example: 'I always fail. If it is not perfect, it is a disaster.',
    regex: /\b(always|never|completely useless|ruined everything|total failure|everyone hates|nobody cares|worthless)\b/i,
    reframingTip: 'Notice the extremes. Ask: "Is it really 100% all or nothing, or is there a middle ground?"',
  },
  {
    id: 'catastrophizing',
    name: 'Catastrophizing',
    description: 'Assuming the worst-case scenario will inevitably happen.',
    example: 'What if I lose everything? My life will be over.',
    regex: /\b(what if|worst case|ruined|my life is over|doomed|can't survive|unbearable|nightmare)\b/i,
    reframingTip: 'Test the probability. What is the most realistic outcome, and how could you cope if things got difficult?',
  },
  {
    id: 'emotional-reasoning',
    name: 'Emotional Reasoning',
    description: 'Believing that because you feel a negative emotion, it must reflect reality.',
    example: 'I feel like a burden, so I must be one.',
    regex: /\b(i feel like (a burden|an imposter|a failure|nobody likes me)|feelings mean|because i feel)\b/i,
    reframingTip: 'Remember: feelings are valid experiences, but they are not always objective facts.',
  },
  {
    id: 'should-statements',
    name: '"Should" Statements',
    description: 'Imposing rigid, guilt-inducing rules on yourself or others.',
    example: 'I should be stronger. I must not feel tired.',
    regex: /\b(i should have|i must|i ought to|i shouldn't be feeling|i should be better)\b/i,
    reframingTip: 'Replace "I should" with compassionate flexibility: "I would prefer to, and I am doing my best right now."',
  },
  {
    id: 'mind-reading',
    name: 'Mind Reading / Jumping to Conclusions',
    description: 'Assuming you know what other people are thinking or feeling about you without proof.',
    example: 'They did not reply, they must think I am annoying.',
    regex: /\b(they (must think|hate me|are judging me|think i'm stupid)|she thinks|he thinks)\b/i,
    reframingTip: 'Check your evidence. Are there other reasons (like them being busy or stressed) for their reaction?',
  },
  {
    id: 'overgeneralization',
    name: 'Overgeneralization',
    description: 'Taking a single negative event and viewing it as a never-ending pattern of defeat.',
    example: 'I messed up the presentation, I can never succeed at work.',
    regex: /\b(nothing ever works|i always mess up|every single time|nothing good happens)\b/i,
    reframingTip: 'Limit the observation to this specific moment rather than applying it to your entire future.',
  }
];

// Sentiment lexicon with valence weights
const SENTIMENT_LEXICON: Record<string, number> = {
  // Positive (+0.4 to +1.0)
  grateful: 0.8, happy: 0.8, calm: 0.7, hopeful: 0.85, relief: 0.75,
  peaceful: 0.8, proud: 0.8, better: 0.6, joy: 0.9, loving: 0.85,
  optimistic: 0.8, accomplished: 0.75, relaxed: 0.7, healing: 0.75,
  content: 0.65, thank: 0.5, energized: 0.7, thriving: 0.85,
  
  // Negative / Distressed (-0.4 to -1.0)
  hopeless: -0.9, miserable: -0.85, depressed: -0.8, anxious: -0.7,
  panic: -0.85, terrified: -0.8, overwhelmed: -0.75, exhausted: -0.6,
  lonely: -0.7, worthless: -0.95, broken: -0.85, hate: -0.75,
  fail: -0.7, ruined: -0.85, dreadful: -0.8, crying: -0.65,
  burden: -0.85, guilty: -0.7, ashamed: -0.75, scared: -0.65,
  angry: -0.65, furious: -0.8, stressed: -0.6, hurt: -0.7
};

// High-risk crisis phrases requiring immediate safety support
const CRISIS_KEYWORDS = [
  'kill myself',
  'suicide',
  'end it all',
  'want to die',
  'better off dead',
  'self harm',
  'cut myself',
  'hanging myself',
  'take all my pills',
  'no reason to live',
  'ending my life'
];

/**
 * Tokenize input text into normalized words
 */
export function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Perform comprehensive NLP analysis on user text
 */
export function analyzeTextNLP(text: string): NLPAnalysisResult {
  const lower = text.toLowerCase();
  const tokens = tokenizeText(text);

  // 1. Crisis Detection
  const isCrisisSignal = CRISIS_KEYWORDS.some((phrase) => lower.includes(phrase));
  const crisisUrgency = isCrisisSignal ? 'high' : undefined;

  // 2. Cognitive Distortion Detection
  const detectedDistortions: CognitiveDistortion[] = [];
  for (const distortion of DISTORTION_PATTERNS) {
    const match = text.match(distortion.regex);
    if (match) {
      detectedDistortions.push({
        id: distortion.id,
        name: distortion.name,
        description: distortion.description,
        example: distortion.example,
        detectedQuote: match[0],
        reframingTip: distortion.reframingTip,
      });
    }
  }

  // 3. Sentiment Analysis
  let totalSentiment = 0;
  let sentimentWordCount = 0;

  for (const token of tokens) {
    if (SENTIMENT_LEXICON[token] !== undefined) {
      totalSentiment += SENTIMENT_LEXICON[token];
      sentimentWordCount++;
    }
  }

  let sentimentScore = 0;
  if (sentimentWordCount > 0) {
    sentimentScore = Math.max(-1, Math.min(1, totalSentiment / Math.sqrt(sentimentWordCount)));
  } else if (lower.includes('good') || lower.includes('great') || lower.includes('better')) {
    sentimentScore = 0.5;
  } else if (lower.includes('bad') || lower.includes('awful') || lower.includes('sad')) {
    sentimentScore = -0.5;
  }

  let sentimentLabel: NLPAnalysisResult['sentimentLabel'] = 'neutral';
  if (sentimentScore >= 0.25) sentimentLabel = 'positive';
  else if (sentimentScore <= -0.55) sentimentLabel = 'negative';
  else if (sentimentScore < 0) sentimentLabel = 'vulnerable';

  // 4. Primary Emotion Classification
  let primaryEmotion: EmotionalTone = 'neutral';
  let emotionConfidence = 0.65;

  if (isCrisisSignal) {
    primaryEmotion = 'overwhelmed';
    emotionConfidence = 0.95;
  } else if (lower.includes('anxious') || lower.includes('panic') || lower.includes('scared') || lower.includes('worry') || lower.includes('nervous')) {
    primaryEmotion = 'anxious';
    emotionConfidence = 0.88;
  } else if (lower.includes('overwhelm') || lower.includes('too much') || lower.includes('drowning') || lower.includes('can\'t cope')) {
    primaryEmotion = 'overwhelmed';
    emotionConfidence = 0.85;
  } else if (lower.includes('sad') || lower.includes('cry') || lower.includes('alone') || lower.includes('lonely') || lower.includes('depress') || lower.includes('grief')) {
    primaryEmotion = 'sad';
    emotionConfidence = 0.84;
  } else if (lower.includes('angry') || lower.includes('mad') || lower.includes('frustrated') || lower.includes('annoyed') || lower.includes('hate')) {
    primaryEmotion = 'frustrated';
    emotionConfidence = 0.82;
  } else if (lower.includes('hope') || lower.includes('looking forward') || lower.includes('try') || lower.includes('progress') || lower.includes('proud')) {
    primaryEmotion = 'hopeful';
    emotionConfidence = 0.86;
  } else if (lower.includes('calm') || lower.includes('peace') || lower.includes('grounded') || lower.includes('relaxed') || lower.includes('breath')) {
    primaryEmotion = 'calm';
    emotionConfidence = 0.87;
  } else if (lower.includes('think') || lower.includes('wonder') || lower.includes('maybe') || lower.includes('realize')) {
    primaryEmotion = 'reflective';
    emotionConfidence = 0.72;
  }

  // 5. Key Themes Extraction
  const keyThemes: string[] = [];
  if (lower.match(/\b(work|job|boss|career|deadline|office|project)\b/)) keyThemes.push('Work & Burnout');
  if (lower.match(/\b(sleep|insomnia|tired|nightmare|rest|exhausted)\b/)) keyThemes.push('Sleep & Rest');
  if (lower.match(/\b(relationship|friend|partner|spouse|family|mom|dad|isolate|lonely)\b/)) keyThemes.push('Relationships');
  if (lower.match(/\b(health|body|pain|illness|physical)\b/)) keyThemes.push('Physical Health');
  if (lower.match(/\b(future|money|finances|uncertain|fear)\b/)) keyThemes.push('Future Anxiety');
  if (lower.match(/\b(self|worth|confidence|imposter|shame)\b/)) keyThemes.push('Self-Worth');

  // 6. Coping Strategy Suggestion
  let suggestedCopingId: string | undefined;
  if (isCrisisSignal || primaryEmotion === 'overwhelmed' || primaryEmotion === 'anxious') {
    suggestedCopingId = 'box-breathing';
  } else if (detectedDistortions.length > 0) {
    suggestedCopingId = 'cbt-reframer';
  } else if (primaryEmotion === 'sad' || primaryEmotion === 'frustrated') {
    suggestedCopingId = 'sensory-grounding';
  } else {
    suggestedCopingId = 'gratitude-journal';
  }

  return {
    sentimentScore: Math.round(sentimentScore * 100) / 100,
    sentimentLabel,
    primaryEmotion,
    emotionConfidence,
    detectedDistortions,
    keyThemes,
    suggestedCopingId,
    isCrisisSignal,
    crisisUrgency,
  };
}
