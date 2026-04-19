import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Groq from 'groq-sdk';
import { useAuth } from '../context/useAuth';
import { estimateMacros, type Macros } from '../data/nutritionLookup';
import { fetchSpoonacularCandidates } from '../data/spoonacularApi';

/* ── Types ──────────────────────────────────────────────────────────── */
interface Meal {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;   // 1.0 – 5.0
  cookTime: number;      // minutes
  ingredients: string[];
  tips: string;
  instructions: string[];
}

/* ── Module-level constants ─────────────────────────────────────────── */
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

const GOAL_LABELS: Record<string, string> = {
  'weight-loss':    'Weight Loss',
  'muscle-gain':    'Muscle Gain',
  'maintenance':    'Maintenance',
  'general-health': 'General Health',
};

/* ══ SUB-COMPONENTS ════════════════════════════════════════════════════ */

/** Shimmer skeleton card shown while loading */
const SkeletonCard = () => (
  <div className="glass rounded-3xl overflow-hidden">
    <div className="shimmer h-1.5 w-full" />
    <div className="p-7 space-y-5">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="shimmer h-3 w-16 rounded-lg" />
          <div className="shimmer h-6 w-3/5 rounded-xl" />
          <div className="shimmer h-4 w-full rounded-lg" />
          <div className="shimmer h-4 w-4/5 rounded-lg" />
        </div>
        <div className="ml-4 space-y-2">
          <div className="shimmer h-5 w-24 rounded-lg" />
          <div className="shimmer h-4 w-16 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[0,1,2,3].map(i => <div key={i} className="shimmer h-16 rounded-2xl" />)}
      </div>
      <div className="shimmer h-2 rounded-full" />
      <div className="flex flex-wrap gap-1.5">
        {[0,1,2,3,4].map(i => <div key={i} className="shimmer h-6 w-16 rounded-lg" />)}
      </div>
    </div>
  </div>
);

/** Colored star health score */
const HealthStars = ({ score }: { score: number }) => {
  const color = score >= 4.5 ? 'text-emerald-400'
              : score >= 3.5 ? 'text-lime-400'
              : score >= 2.5 ? 'text-amber-400'
              : 'text-rose-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <svg key={i} className={`w-4 h-4 transition-colors ${i <= Math.round(score) ? color : 'text-gray-800'}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
      <span className={`text-sm font-black ${color}`}>{score.toFixed(1)}</span>
    </div>
  );
};

/** Macro pill block */
const MacroPill = ({ label, value, unit, color, bg }: {
  label: string; value: number; unit: string; color: string; bg: string;
}) => (
  <div className={`flex flex-col items-center gap-1 ${bg} rounded-2xl py-4 px-2`}>
    <span className={`text-2xl font-black ${color}`}>{value}</span>
    <span className="text-gray-600 text-[10px]">{unit}</span>
    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </div>
);

/** Macro ratio bar */
const MacroRatioBar = ({ protein, carbs, fat, calories }: {
  protein: number; carbs: number; fat: number; calories: number;
}) => {
  const total = protein * 4 + carbs * 4 + fat * 9 || 1;
  const p = Math.round(protein * 4 / total * 100);
  const c = Math.round(carbs   * 4 / total * 100);
  const f = Math.round(fat     * 9 / total * 100);
  return (
    <div className="space-y-2">
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
        <div className="bg-blue-500/70   rounded-l-full" style={{ width: `${p}%` }} />
        <div className="bg-purple-500/70" style={{ width: `${c}%` }} />
        <div className="bg-rose-500/70   rounded-r-full" style={{ width: `${f}%` }} />
      </div>
      <div className="flex gap-4 text-[10px] text-gray-600">
        <span><span className="text-blue-400   font-bold">■</span> Protein {p}%</span>
        <span><span className="text-purple-400 font-bold">■</span> Carbs {c}%</span>
        <span><span className="text-rose-400   font-bold">■</span> Fat {f}%</span>
        <span className="ml-auto text-gray-700">{calories} kcal</span>
      </div>
    </div>
  );
};

/** Full meal result card */
const MealCard = ({ meal, rank, onSelect }: { meal: Meal; rank: number; onSelect: () => void }) => {
  const accents = [
    { strip: 'from-emerald-500/70 to-sky-500/0',  border: 'border-emerald-500/15', badge: 'bg-emerald-500/15 text-emerald-400' },
    { strip: 'from-sky-500/70    to-violet-500/0', border: 'border-sky-500/15',     badge: 'bg-sky-500/15     text-sky-400'     },
    { strip: 'from-violet-500/70 to-rose-500/0',   border: 'border-violet-500/15',  badge: 'bg-violet-500/15  text-violet-400'  },
  ];
  const a = accents[rank] ?? accents[0];
  const cookColor = meal.cookTime <= 20 ? 'text-emerald-400' : meal.cookTime <= 40 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className={`glass rounded-3xl overflow-hidden border ${a.border}
      hover:scale-[1.012] hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 flex flex-col`}>

      {/* Coloured top strip */}
      <div className={`h-1.5 bg-gradient-to-r ${a.strip}`} />

      <div className="p-7 space-y-5 flex flex-col flex-1">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className={`inline-block text-[10px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md mb-2 ${a.badge}`}>
              Meal {rank + 1}
            </span>
            <h3 className="text-xl font-black text-white leading-snug">{meal.name}</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">{meal.description}</p>
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-2.5 pt-1">
            <HealthStars score={meal.healthScore} />
            <div className={`flex items-center gap-1.5 text-xs font-bold ${cookColor}`}>
              <span>⏱</span><span>{meal.cookTime} min</span>
            </div>
          </div>
        </div>

        {/* Macro pills */}
        <div className="grid grid-cols-4 gap-2">
          <MacroPill label="Calories" value={meal.calories} unit="kcal"
            color="text-amber-400"  bg="bg-amber-500/8"  />
          <MacroPill label="Protein"  value={meal.protein}  unit="g"
            color="text-blue-400"   bg="bg-blue-500/8"   />
          <MacroPill label="Carbs"    value={meal.carbs}    unit="g"
            color="text-purple-400" bg="bg-purple-500/8" />
          <MacroPill label="Fat"      value={meal.fat}      unit="g"
            color="text-rose-400"   bg="bg-rose-500/8"   />
        </div>

        {/* Ratio bar */}
        <MacroRatioBar protein={meal.protein} carbs={meal.carbs}
          fat={meal.fat} calories={meal.calories} />

        {/* Ingredients chips */}
        <div>
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.15em] mb-2">
            Ingredients used · {meal.ingredients.length}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {meal.ingredients.map(ing => (
              <span key={ing} className="px-2.5 py-1 rounded-lg
                bg-white/4 border border-white/6 text-gray-400 text-xs font-medium">
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Chef tip */}
        {meal.tips && (
          <div className="mt-auto mb-4 flex items-start gap-2.5
            bg-emerald-950/50 border border-emerald-800/25 rounded-2xl px-4 py-3.5">
            <span className="text-base flex-shrink-0">💡</span>
            <p className="text-emerald-300/75 text-xs leading-relaxed">{meal.tips}</p>
          </div>
        )}

        {/* Action Button */}
        <button onClick={onSelect}
          className="mt-auto w-full py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm
            hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-300 transition-all duration-200 cursor-pointer">
          View Recipe Details →
        </button>
      </div>
    </div>
  );
};

/* ══ RESULTS PAGE ═══════════════════════════════════════════════════════ */
const Results = () => {
  const { activeProfiles, addHistoryEntry } = useAuth();
  const navigate = useNavigate();

  /* Derive ingredients + macros once (stable across renders) */
  const ingredients: string[] = (() => {
    try { return JSON.parse(sessionStorage.getItem('nutriLensIngredients') ?? '[]') as string[]; }
    catch { return []; }
  })();
  const estimatedMacros: Macros = estimateMacros(ingredients);

  /* Early guards computed before state so they don't need setState in effects */
  const initError: string | null =
    ingredients.length === 0
      ? 'No ingredients found. Go back and select some ingredients first.'
      : !GROQ_KEY
      ? 'VITE_GROQ_API_KEY is not set in .env.local — add your Groq API key to enable AI meal suggestions.'
      : null;

  const [exactMeals, setExactMeals] = useState<Meal[]>([]);
  const [additionalMeals, setAdditionalMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(initError === null);
  const [error,   setError]   = useState<string | null>(initError);
  const [phase,   setPhase]   = useState('Sending to Llama…');
  const [retryIn, setRetryIn] = useState<number | null>(null); // countdown seconds

  /* ── Retry helper: waits `seconds` with live countdown, then resolves ── */
  const waitWithCountdown = (seconds: number): Promise<void> =>
    new Promise(resolve => {
      let remaining = Math.ceil(seconds);
      setRetryIn(remaining);
      const tick = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(tick);
          setRetryIn(null);
          resolve();
        } else {
          setRetryIn(remaining);
        }
      }, 1000);
    });

  /* ── Groq API call with automatic 429 retry ── */
  const callGroq = async () => {
    if (!GROQ_KEY) return;
    setLoading(true); setError(null); setRetryIn(null);
    const MAX_RETRIES = 3;
    try {
      setPhase('Fetching real recipes from Spoonacular…');
      const candidates = await fetchSpoonacularCandidates(ingredients, 15);
      
      const candidateText = candidates.map(c => {
        let text = `- Title: ${c.title}\n`;
        text += `  Cook Time: ${c.readyInMinutes}m, Health Score: ${c.healthScore}\n`;
        text += `  Additional Ingredients Needed: ${c.missedIngredientCount ?? 0}\n`;
        if (c.nutrition && c.nutrition.nutrients) {
          const cals = Math.round(c.nutrition.nutrients.find((n:any) => n.name==='Calories')?.amount || 0);
          const pro = Math.round(c.nutrition.nutrients.find((n:any) => n.name==='Protein')?.amount || 0);
          const car = Math.round(c.nutrition.nutrients.find((n:any) => n.name==='Carbohydrates')?.amount || 0);
          const fat = Math.round(c.nutrition.nutrients.find((n:any) => n.name==='Fat')?.amount || 0);
          text += `  Macros: ${cals} kcal, ${pro}g protein, ${car}g carbs, ${fat}g fat\n`;
        }
        if (c.extendedIngredients) {
          text += `  Ingredients: ${c.extendedIngredients.map((i:any) => i.original).join(' | ')}\n`;
        }
        if (c.analyzedInstructions && c.analyzedInstructions[0]) {
          text += `  Instructions: ${c.analyzedInstructions[0].steps.map((s:any) => s.step).join(' ')}\n`;
        }
        return text;
      }).join('\n');

      setPhase('Analysing your ingredients & recipes…');
      await new Promise(r => setTimeout(r, 400));
      setPhase('Building personalised meal plan…');

      const profileSummaries = activeProfiles.map(p =>
        `• ${p.name}: ${p.age}y, ${p.gender}, ${p.weight}kg, ${p.height}cm` +
        (p.goal              ? `, goal: ${GOAL_LABELS[p.goal] ?? p.goal}` : '') +
        (p.dietaryPreferences?.length ? `, diet: ${p.dietaryPreferences.join(', ')}` : '')
      ).join('\n');

      const prompt = `You are an expert nutritionist and chef.
Based on the PROFILES and the REAL RECIPES provided below, select up to 6 recipes that best fit the users' goals.

USER PROFILES:
${profileSummaries || '• No specific profile provided'}

CANDIDATE RECIPES (from Spoonacular Database):
${candidateText ? candidateText : 'No database recipes found. Fall back to your own recipe generation based on these ingredients: ' + ingredients.join(', ')}

STRICT RULES:
- If Candidate Recipes are provided, ONLY choose from them. DO NOT INVENT RECIPES unless necessary.
- Divide the recipes into TWO separate categories:
  1. "exactMeals": Recipes that require EXACTLY OR FEWER ingredients than what the user provided (Additional Ingredients Needed: 0). If you invent a recipe for this list, it CANNOT use ANY ingredients outside of: ${ingredients.join(', ')}. Wait, water, salt, and pepper are free ingredients. If no valid recipe can be made, leave this array EMPTY.
  2. "additionalMeals": Recipes that require some additional ingredients (Additional Ingredients Needed > 0).
- Select a combined total of up to 6 recipes that best align with the given user goals.
- Extract their precise macros, cook time, ingredients, and instructions from the provided text.
- Health score must be a decimal out of 5.0 (map Spoonacular's 0-100 score to 1.0-5.0).
- Provide practical tips for cooking or meeting the nutrition goals.
- IMPORTANT: Instructions must be DETAILED and ELABORATE. Each step should include specific cooking times, temperatures, techniques, and the reason behind the action. Aim for at least 6-8 steps per recipe.

Respond with ONLY this JSON (no markdown, no explanation):
{
  "exactMeals": [
    {
      "name": "dish name",
      "description": "1-2 sentence description of the dish",
      "calories": <number>,
      "protein": <number in grams>,
      "carbs": <number in grams>,
      "fat": <number in grams>,
      "healthScore": <decimal 1.0-5.0>,
      "cookTime": <number in minutes>,
      "ingredients": ["ingredient1 with amount", "ingredient2 with amount"],
      "tips": "one practical cooking tip",
      "instructions": ["Step 1: Detailed instruction with time, temperature, and technique...", "Step 2: ...", "Step 3: ..."]
    }
  ],
  "additionalMeals": [
    {
      // strictly follow the exact same schema as exactMeals
    }
  ]
}`;

      setPhase('Generating your meals…');
      const client = new Groq({ apiKey: GROQ_KEY, dangerouslyAllowBrowser: true });

      let lastError: Error | null = null;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const completion = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000,
          });

          const raw = completion.choices[0]?.message?.content ?? '';
          const parsed = JSON.parse(raw) as { exactMeals?: Meal[], additionalMeals?: Meal[] };
          if ((!parsed.exactMeals || !Array.isArray(parsed.exactMeals)) && (!parsed.additionalMeals || !Array.isArray(parsed.additionalMeals)))
            throw new Error('Unexpected response structure from AI');

          setExactMeals(parsed.exactMeals || []);
          setAdditionalMeals(parsed.additionalMeals || []);
          return; // success — exit loop
        } catch (err: any) {
          const msg: string = err?.message ?? String(err);
          // Detect 429 rate limit
          const is429 = msg.includes('429') || msg.toLowerCase().includes('rate_limit');
          if (is429 && attempt < MAX_RETRIES - 1) {
            // Parse wait time from Groq error message ("Please try again in 15.7s")
            const match = msg.match(/(\d+\.?\d*)s/);
            const waitSec = match ? parseFloat(match[1]) + 1 : 20;
            setPhase(`Rate limited — retrying in…`);
            await waitWithCountdown(waitSec);
            setPhase('Retrying…');
            lastError = new Error(msg);
            continue;
          }
          throw err; // non-429 or final attempt
        }
      }
      if (lastError) throw lastError;
    } catch (e) {
      console.error(e);
      setError(
        e instanceof SyntaxError
          ? 'Could not parse AI response. Try again.'
          : String(e).replace('Error: ', '')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initError) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void callGroq();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ══ LOADING STATE ══════════════════════════════════════════════════ */
  if (loading) return (
    <div className="page-enter space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="shimmer h-9 w-64 rounded-xl" />
          <div className="shimmer h-4 w-96 rounded-lg" />
        </div>
      </div>

      {/* Phase banner */}
      <div className={`glass rounded-2xl px-6 py-5 flex items-center gap-5 transition-all duration-300 ${
        retryIn !== null ? 'border border-amber-500/30 bg-amber-950/20' : ''
      }`}>
        <div className="relative w-10 h-10 flex-shrink-0">
          {retryIn !== null ? (
            <svg className="w-10 h-10 text-amber-500" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeOpacity="0.2"/>
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeDasharray="94.2" strokeDashoffset="0"
                strokeLinecap="round" transform="rotate(-90 18 18)"/>
              <text x="18" y="22" textAnchor="middle"
                fill="#fbbf24" fontSize="11" fontWeight="900">{retryIn}</text>
            </svg>
          ) : (
            <svg className="animate-spin w-10 h-10 text-emerald-500 absolute inset-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className={`font-bold ${retryIn !== null ? 'text-amber-300' : 'text-white'}`}>{phase}</p>
          {retryIn !== null ? (
            <p className="text-amber-600 text-xs mt-0.5">
              Groq rate limit hit &mdash; auto-retrying in <span className="text-amber-400 font-black">{retryIn}s</span>
            </p>
          ) : (
            <p className="text-gray-600 text-xs mt-0.5">
              Powered by <span className="text-emerald-500 font-semibold">Llama 3 70B</span> via Groq
            </p>
          )}
        </div>
        {retryIn === null && (
          <div className="ml-auto flex items-center gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-emerald-500"
                style={{ animation: `pulse 1.4s ease-in-out ${i * 0.25}s infinite` }} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    </div>
  );

  /* ══ ERROR STATE ════════════════════════════════════════════════════ */
  if (error) return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">🍽️ Meal Suggestions</h1>
        <p className="text-gray-500 text-sm mt-1">Something went wrong</p>
      </div>
      <div className="glass rounded-3xl p-12 flex flex-col items-center text-center max-w-xl mx-auto">
        <span className="text-6xl mb-6">⚠️</span>
        <p className="text-white font-black text-xl mb-3">Couldn't generate meals</p>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md">{error}</p>
        {!GROQ_KEY && (
          <div className="text-left w-full bg-[#0e1117] rounded-2xl p-5 mb-6 border border-white/6 space-y-3">
            <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">Add to .env.local</p>
            <code className="block text-emerald-300 text-sm">VITE_GROQ_API_KEY=your-key-here</code>
            <div className="border-t border-white/6 pt-3">
              <p className="text-gray-500 text-xs">Get a free key at{' '}
                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer"
                  className="text-emerald-400 hover:underline font-medium">
                  console.groq.com/keys
                </a>
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Uses <strong className="text-gray-500">Llama 3 70B</strong> — free tier available
              </p>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => navigate('/scan')}
            className="px-5 py-2.5 rounded-2xl border border-white/8 text-gray-300
              hover:border-white/15 hover:text-white text-sm font-semibold transition-all cursor-pointer">
            ← Back to Ingredients
          </button>
          {GROQ_KEY && (
            <button onClick={() => { void callGroq(); }}
              className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400
                text-gray-950 font-bold text-sm transition-all cursor-pointer">
              Try Again →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ══ RESULTS ════════════════════════════════════════════════════════ */
  return (
    <div className="page-enter space-y-8 relative">

      {/* ── Recipe Modal Overlay ── */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMeal(null)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#070a0e] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-start bg-emerald-950/20">
              <div>
                <h2 className="text-2xl font-black text-white pr-8">{selectedMeal.name}</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-xs font-semibold text-gray-400">
                  <span className="flex items-center gap-1">⏱ {selectedMeal.cookTime} mins</span>
                  <span className="text-amber-400">🔥 {selectedMeal.calories} kcal</span>
                </div>
              </div>
              <button onClick={() => setSelectedMeal(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 cursor-pointer bg-white/5 rounded-full hover:bg-white/10 transition-colors">✕</button>
            </div>
            
            {/* Scrollable Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1">
              
              <div>
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Ingredients Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMeal.ingredients.map(ing => (
                    <span key={ing} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Step-by-Step Instructions</h3>
                <ol className="space-y-5">
                  {selectedMeal.instructions?.map((step, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 font-black text-xs border border-emerald-500/30 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 bg-white/3 border border-white/6 rounded-xl px-4 py-3">
                        <p className="text-gray-200 text-sm leading-7">{step}</p>
                      </div>
                    </li>
                  ))}
                  {(!selectedMeal.instructions || selectedMeal.instructions.length === 0) && (
                    <p className="text-gray-500 italic text-sm">No instructions provided.</p>
                  )}
                </ol>
              </div>

              {selectedMeal.tips && (
                <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-2xl p-4 flex gap-3 items-start">
                  <span className="text-xl">💡</span>
                  <p className="text-emerald-300/80 text-sm leading-relaxed">{selectedMeal.tips}</p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-[#0a0e14] flex justify-between gap-4">
              <button onClick={() => setSelectedMeal(null)}
                className="px-6 py-3 rounded-2xl border border-white/10 text-gray-400 font-semibold text-sm hover:text-white hover:bg-white/5 transition-colors cursor-pointer w-full max-w-fit">
                ← Go Back
              </button>
              <button 
                onClick={() => {
                  addHistoryEntry({
                    profileIds: activeProfiles.map(p => p.id),
                    mealName: selectedMeal.name,
                    calories: selectedMeal.calories,
                    protein: selectedMeal.protein,
                    carbs: selectedMeal.carbs,
                    fat: selectedMeal.fat,
                    ingredients: selectedMeal.ingredients
                  });
                  setSelectedMeal(null);
                  navigate('/history');
                }}
                className="flex-1 px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 cursor-pointer">
                Confirm & Add to History →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">🍽️ Your Meal Suggestions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Personalised by <span className="text-emerald-400 font-semibold">Llama 3.3 70B</span> via Groq — based on your profile and ingredients
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button onClick={() => navigate('/scan')}
            className="px-4 py-2.5 rounded-2xl border border-white/8 text-gray-400
              hover:border-white/15 hover:text-white text-sm font-semibold transition-all cursor-pointer">
            ← Change Ingredients
          </button>
          <button onClick={() => { void callGroq(); }}
            className="px-4 py-2.5 rounded-2xl glass border border-white/8 text-gray-300
              hover:border-emerald-500/40 hover:text-white text-sm font-semibold transition-all cursor-pointer">
            🔄 Regenerate
          </button>
        </div>
      </div>

      {/* ── Context strip ── */}
      <div className="glass rounded-2xl px-6 py-4 flex items-center gap-5 flex-wrap">
        {/* Active profiles */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {activeProfiles.slice(0,4).map((p, i) => (
              <span key={p.id} style={{ zIndex: activeProfiles.length - i }}
                className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#070a0e]
                  flex items-center justify-center text-base">
                {p.avatar}
              </span>
            ))}
          </div>
          <div>
            <p className="text-white text-sm font-bold">
              {activeProfiles.map(p => p.name.split(' ')[0]).join(', ') || 'No profiles'}
            </p>
            <p className="text-gray-600 text-xs">
              {activeProfiles.map(p => p.goal ? GOAL_LABELS[p.goal] : '—').join(' · ')}
            </p>
          </div>
        </div>

        <div className="w-px h-8 bg-white/6 hidden sm:block" />

        {/* Ingredient count */}
        <div>
          <p className="text-gray-600 text-xs">Ingredients</p>
          <p className="text-white text-sm font-bold">{ingredients.length} items</p>
        </div>



        {/* Model badge */}
        <div className="ml-auto flex items-center gap-2 bg-emerald-950/50 border border-emerald-800/30
          rounded-xl px-3 py-2">
          <span className="text-sm">⚡</span>
          <span className="text-xs text-emerald-400 font-semibold">Llama 3 70B · Groq</span>
        </div>
      </div>

      {/* ── Exact Meals ── */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6">Cook Now (You have all ingredients)</h2>
        {exactMeals.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center p-12 rounded-3xl border border-rose-500/10 bg-rose-500/5 text-center">
            <span className="text-4xl mb-4">🛒</span>
            <h3 className="text-white font-bold text-lg mb-2">No exact matches found</h3>
            <p className="text-gray-400 text-sm max-w-md">There aren't any recipes available that use exactly or fewer than your selected ingredients. Try selecting more ingredients or check out the suggestions below!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exactMeals.map((meal, i) => (
              <MealCard key={`${meal.name}-${i}`} meal={meal} rank={i}
                onSelect={() => {
                  setSelectedMeal(meal);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Additional Meals ── */}
      {additionalMeals.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-1">
            <h2 className="text-xl font-bold text-white">Worth the Grocery Run 🛒</h2>
            <div className="h-px bg-white/10 flex-1" />
          </div>
          <p className="text-gray-400 text-sm mb-6">These delicious meals require just a few extra ingredients you don't have yet.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalMeals.map((meal, i) => (
              <MealCard key={`${meal.name}-${i}`} meal={meal} rank={i + exactMeals.length}
                onSelect={() => {
                  setSelectedMeal(meal);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom bar ── */}
      <div className="flex items-center justify-between py-2">
        <p className="text-gray-700 text-xs max-w-lg">
          Nutrition estimates are AI-generated approximations. Actual values depend on cooking method and portion size.
          Consult a dietitian for medical nutrition advice.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button onClick={() => navigate('/history')}
            className="px-5 py-2.5 rounded-2xl border border-white/8 text-gray-400
              hover:border-white/15 hover:text-white text-sm font-semibold transition-all cursor-pointer">
            View History
          </button>
          <button onClick={() => navigate('/home')}
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400
              active:scale-[0.98] text-gray-950 font-bold text-sm transition-all
              cursor-pointer shadow-lg shadow-emerald-900/40">
            Done → Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
