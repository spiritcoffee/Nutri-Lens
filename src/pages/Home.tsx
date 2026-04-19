import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import type { NutriProfile, NutriGoal, DietaryPref } from '../context/authContext';

/* ── AVATARS ── */
const AVATARS = ['👤','👦','👧','👨','👩','👴','👵','🧑','👨‍🍳','👩‍🍳'];
const GOALS: { value: NutriGoal; label: string }[] = [
  { value: 'weight-loss',    label: '⚖️ Weight Loss'   },
  { value: 'muscle-gain',    label: '💪 Muscle Gain'   },
  { value: 'maintenance',    label: '🔁 Maintenance'   },
  { value: 'general-health', label: '❤️ General Health' },
];
const DIETS: { value: DietaryPref; label: string }[] = [
  { value: 'vegetarian',  label: '🥦 Vegetarian' },
  { value: 'vegan',       label: '🌱 Vegan'       },
  { value: 'gluten-free', label: '🌾 Gluten-Free' },
  { value: 'dairy-free',  label: '🥛 Dairy-Free'  },
  { value: 'low-carb',    label: '🥩 Low-Carb'    },
  { value: 'high-protein',label: '🍗 High-Protein' },
];

/* ── Edit Modal ───────────────────────────────────────────────────────── */
const EditModal = ({ profile, onSave, onClose }: {
  profile: NutriProfile;
  onSave: (p: NutriProfile) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<NutriProfile>({ ...profile });
  const set = (k: keyof NutriProfile, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const toggleDiet = (d: DietaryPref) => {
    const prefs = form.dietaryPreferences ?? [];
    const next = prefs.includes(d) ? prefs.filter(x => x !== d) : [...prefs, d];
    set('dietaryPreferences', next);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg bg-[#0b0f14] border border-white/10
        rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="sticky top-0 bg-[#0b0f14] border-b border-white/8 px-6 py-4
          flex items-center justify-between">
          <h3 className="text-white font-black text-lg">Edit Profile</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/6 hover:bg-white/12 flex items-center
              justify-center text-gray-400 hover:text-white transition-all cursor-pointer">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Avatar picker */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-2">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(a => (
                <button key={a} onClick={() => set('avatar', a)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center
                    transition-all cursor-pointer border-2 ${
                    form.avatar === a
                      ? 'border-emerald-500 bg-emerald-500/20 scale-110'
                      : 'border-white/8 bg-white/4 hover:border-emerald-500/50'
                  }`}>{a}</button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-2">Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5
                text-white text-sm outline-none focus:border-emerald-500/60 focus:ring-1
                focus:ring-emerald-500/30 transition-all" />
          </div>

          {/* Age / Weight / Height */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Age', key: 'age' as const, unit: 'yr', min: 5, max: 120 },
              { label: 'Weight', key: 'weight' as const, unit: 'kg', min: 20, max: 300 },
              { label: 'Height', key: 'height' as const, unit: 'cm', min: 50, max: 250 },
            ].map(({ label, key, unit, min, max }) => (
              <div key={key}>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-2">
                  {label} ({unit})
                </label>
                <input type="number" min={min} max={max}
                  value={form[key] as number}
                  onChange={e => set(key, Number(e.target.value))}
                  className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5
                    text-white text-sm outline-none focus:border-emerald-500/60 focus:ring-1
                    focus:ring-emerald-500/30 transition-all" />
              </div>
            ))}
          </div>

          {/* Gender */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-2">Gender</label>
            <div className="flex gap-2">
              {(['Male','Female','Other'] as const).map(g => (
                <button key={g} onClick={() => set('gender', g)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                    form.gender === g
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/10 bg-white/4 text-gray-400 hover:border-emerald-500/40'
                  }`}>{g}</button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-2">Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(({ value, label }) => (
                <button key={value} onClick={() => set('goal', value)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
                    form.goal === value
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/10 bg-white/4 text-gray-400 hover:border-emerald-500/40'
                  }`}>{label}</button>
              ))}
            </div>
          </div>

          {/* Dietary prefs */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-2">Dietary Preferences</label>
            <div className="flex flex-wrap gap-2">
              {DIETS.map(({ value, label }) => {
                const active = form.dietaryPreferences?.includes(value);
                return (
                  <button key={value} onClick={() => toggleDiet(value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-white/10 bg-white/4 text-gray-400 hover:border-emerald-500/40'
                    }`}>{label}</button>
                );
              })}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400
              text-gray-950 font-black text-sm transition-all duration-200
              cursor-pointer shadow-lg shadow-emerald-900/40 mt-2">
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Nutrition progress card ─────────────────────────────────────────── */
const NutritionCard = ({
  label, consumed, target, unit, color, barColor,
}: {
  label: string; consumed: number; target: number;
  unit: string; color: string; barColor: string;
}) => {
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const isOver = consumed > target;
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-3">
      {/* Label + percentage */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{label}</span>
        <span className={`text-xs font-bold tabular-nums ${
          isOver ? 'text-rose-400' : pct >= 80 ? 'text-emerald-400' : 'text-gray-500'
        }`}>{pct}%</span>
      </div>
      {/* Value display */}
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black tabular-nums ${isOver ? 'text-rose-400' : color}`}>
          {consumed}
        </span>
        <span className="text-gray-600 text-xs">/</span>
        <span className="text-gray-500 text-sm font-semibold tabular-nums">{target}</span>
        <span className="text-gray-600 text-xs">{unit}</span>
      </div>
      {/* Progress track */}
      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
            isOver ? 'bg-rose-500' : barColor
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Remaining or over */}
      <p className="text-[10px] text-gray-700 tabular-nums">
        {isOver
          ? `${consumed - target} ${unit} over target`
          : consumed === 0
          ? `Target: ${target} ${unit}`
          : `${target - consumed} ${unit} remaining`}
      </p>
    </div>
  );
};




/* ════════════════════════════════════════════════════════════════════════ */
const Home = () => {
  const { activeProfiles, updateProfile, history, goalDays, markGoalDay } = useAuth();
  const navigate = useNavigate();
  const [editingProfile, setEditingProfile] = useState<NutriProfile | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const isGroup = activeProfiles.length > 1;
  const primary = activeProfiles[0];

  /* ── Daily macro targets adjusted for BMI ── */
  let sumCals = 0, sumPro = 0, sumFat = 0, sumCarbs = 0;
  if (activeProfiles.length > 0) {
    activeProfiles.forEach(p => {
      const bmr = p.gender === 'Female'
        ? 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
        : 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
      const tdee = bmr * 1.375;
      
      const bmi = p.weight / ((p.height / 100) ** 2);
      let calTarget = tdee;
      let proTarget = 1.6 * p.weight;
      
      if (bmi < 18.5) {
        calTarget += 400; // Healthy surplus to gain weight
        proTarget = 1.8 * p.weight;
      } else if (bmi >= 25) {
        calTarget -= 500; // Healthy deficit to lose weight
        const idealWeight = 22 * ((p.height / 100) ** 2);
        proTarget = 1.6 * idealWeight; // Prevent huge protein targets
      }
      
      const fatTarget = (calTarget * 0.25) / 9;
      const carbTarget = (calTarget - (proTarget * 4) - (fatTarget * 9)) / 4;
      
      sumCals += calTarget;
      sumPro += proTarget;
      sumFat += fatTarget;
      sumCarbs += carbTarget;
    });
  }

  const avgTdee = activeProfiles.length ? Math.round(sumCals / activeProfiles.length) : 2000;
  const targetProtein = activeProfiles.length ? Math.round(sumPro / activeProfiles.length) : 140;
  const targetFat = activeProfiles.length ? Math.round(sumFat / activeProfiles.length) : 55;
  const targetCarbs = activeProfiles.length ? Math.round(sumCarbs / activeProfiles.length) : 236;

  /* ── Auto-refresh across midnight ── */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  /* ── Today's consumed ── */
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  // Local YYYY-MM-DD avoids timezone skew from toISOString()
  const todayStr = `${todayStart.getFullYear()}-${String(todayStart.getMonth() + 1).padStart(2, '0')}-${String(todayStart.getDate()).padStart(2, '0')}`;
  const activeIds = new Set(activeProfiles.map(p => p.id));

  const consumed = history
    .filter(e => e.timestamp >= todayMs && e.profileIds.some(id => activeIds.has(id)))
    .reduce(
      (acc, e) => ({
        calories: acc.calories + (e.calories ?? 0),
        protein:  acc.protein  + (e.protein  ?? 0),
        carbs:    acc.carbs    + (e.carbs    ?? 0),
        fat:      acc.fat      + (e.fat      ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

  /* ── Goal satisfaction — show celebration only once per day ── */
  const goalsReached =
    consumed.calories >= avgTdee &&
    consumed.protein  >= targetProtein;

  useEffect(() => {
    if (goalsReached && activeProfiles.length > 0) {
      markGoalDay(todayStr);
      // Only show confetti once per calendar day
      const celebKey = `nutri-lens-celebrated-${todayStr}`;
      if (!localStorage.getItem(celebKey)) {
        localStorage.setItem(celebKey, '1');
        setShowCelebration(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalsReached]);

  /* ── Streak calculation ── */
  const goalDaysSet = new Set(goalDays);

  const isoDate = (d: Date) => d.toISOString().split('T')[0];

  const currentStreak = (() => {
    let streak = 0;
    const d = new Date(todayStart);
    while (true) {
      if (!goalDaysSet.has(isoDate(d))) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  })();

  const longestStreak = (() => {
    if (goalDays.length === 0) return 0;
    const sorted = [...goalDays].sort();
    let max = 1, cur = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i-1]);
      prev.setDate(prev.getDate() + 1);
      if (isoDate(prev) === sorted[i]) { cur++; max = Math.max(max, cur); }
      else cur = 1;
    }
    return max;
  })();

  /* ── Heatmap: monthly grid with year selector ── */
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const thisYear = todayStart.getFullYear();
  const allYears = Array.from(
    new Set([thisYear, ...goalDays.map(d => parseInt(d.slice(0,4)))])
  ).sort((a,b) => b - a);
  const [selectedYear, setSelectedYear] = useState(thisYear);

  // Build full year grid grouped by month
  // Pre-calculate daily logged calories for the progress heatmap mapped by local YYYY-MM-DD
  const historyByDay: Record<string, number> = {};
  history.filter(e => e.profileIds.some(id => activeIds.has(id))).forEach(e => {
    const d = new Date(e.timestamp);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    historyByDay[ds] = (historyByDay[ds] || 0) + (e.calories || 0);
  });

  const monthGrids = MONTH_NAMES.map((month, mi) => {
    const days: { date: string; active: boolean; isToday: boolean; status: 'blank'|'light'|'dark'|'met'; cals: number }[] = [];
    const first = new Date(selectedYear, mi, 1);
    const last  = new Date(selectedYear, mi + 1, 0);
    // leading blanks so day 1 aligns to its week day (Mon=0)
    const startDow = (first.getDay() + 6) % 7;
    for (let b = 0; b < startDow; b++) days.push({ date: '', active: false, isToday: false, status: 'blank', cals: 0 });
    for (let d = 1; d <= last.getDate(); d++) {
      const dt  = new Date(selectedYear, mi, d);
      const str = isoDate(dt);
      const isMet = goalDaysSet.has(str);
      const cals = historyByDay[str] || 0;
      let status: 'blank' | 'light' | 'dark' | 'met' = 'blank';
      if (isMet) {
        status = 'met';
      } else if (cals > 0) {
        status = (cals / avgTdee) >= 0.5 ? 'dark' : 'light';
      }
      days.push({ date: str, active: isMet, isToday: str === todayStr, status, cals });
    }
    return { month, days };
  });

  /* ── Confetti particles ── */
  const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    dur:   `${1.5 + Math.random()}s`,
    color: ['#10b981','#f59e0b','#3b82f6','#ec4899','#a78bfa','#f97316'][i % 6],
    size:  `${6 + Math.random() * 8}px`,
    rotate:`${Math.round(Math.random() * 360)}deg`,
  }));

  return (
    <div className="page-enter space-y-8">

      {/* ── CSS for confetti ── */}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes celebrate-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .confetti-piece { position: fixed; top: -20px; pointer-events: none; z-index: 9999;
          border-radius: 2px; animation: confetti-fall linear forwards; }
        .celebrate-card { animation: celebrate-pop 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes streak-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(251,146,60,0); }
          50%      { box-shadow: 0 0 0 8px rgba(251,146,60,0); }
        }
        .streak-fire { animation: streak-pulse 2s ease infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes tooltip-in {
          0%   { opacity: 0; transform: translateY(4px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .day-tooltip { animation: tooltip-in 0.12s ease both; }
      `}</style>

      {/* ── Celebration overlay ── */}
      {showCelebration && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center"
          onClick={() => setShowCelebration(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* Confetti */}
          {CONFETTI.map(p => (
            <div key={p.id} className="confetti-piece"
              style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur,
                width: p.size, height: p.size, background: p.color, transform: `rotate(${p.rotate})` }} />
          ))}
          {/* Card */}
          <div className="celebrate-card relative z-10 bg-[#0b0f14] border border-emerald-500/30
            rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl shadow-emerald-900/50">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-white mb-2">Goals Crushed!</h2>
            <p className="text-gray-400 text-sm mb-6">
              You've hit all your macro targets for today. Amazing discipline!
            </p>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="px-5 py-3 rounded-2xl bg-orange-500/15 border border-orange-500/30">
                <p className="text-orange-400 font-black text-3xl">{currentStreak}</p>
                <p className="text-orange-300/70 text-[10px] font-bold uppercase tracking-wider">day streak 🔥</p>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
                <p className="text-emerald-400 font-black text-3xl">{longestStreak}</p>
                <p className="text-emerald-300/70 text-[10px] font-bold uppercase tracking-wider">longest ever</p>
              </div>
            </div>
            <button onClick={() => setShowCelebration(false)}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400
                text-gray-950 font-black text-sm transition-all cursor-pointer">
              Keep it up! 💪
            </button>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingProfile && (
        <EditModal
          profile={editingProfile}
          onSave={updateProfile}
          onClose={() => setEditingProfile(null)}
        />
      )}

      {/* ══ HERO BANNER ═══════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden h-[260px]">
        <img src="/hero-food.png" alt="food"
          className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070a0e]/85 via-[#070a0e]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a0e]/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          {isGroup ? (
            <>
              <div className="flex -space-x-2 mb-3">
                {activeProfiles.slice(0,5).map((p,i) => (
                  <span key={p.id} style={{zIndex: activeProfiles.length - i}}
                    className="w-9 h-9 rounded-full border-2 border-[#070a0e] bg-gray-800 flex items-center justify-center text-lg">
                    {p.avatar}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Hey {activeProfiles.map(p => p.name.split(' ')[0]).join(', ')} 👋
              </h1>
              <p className="text-emerald-400 text-sm font-semibold mt-1">
                Tracking nutrition for {activeProfiles.length} people today
              </p>
            </>
          ) : primary ? (
            <>
              <span className="text-5xl mb-2">{primary.avatar}</span>
              <h1 className="text-3xl font-black text-white tracking-tight">Hey, {primary.name.split(' ')[0]}! 👋</h1>
              <p className="text-gray-400 text-sm mt-1">{primary.age}y · {primary.gender} · {primary.weight}kg</p>
            </>
          ) : null}
        </div>

      </div>

      {/* ══ MAIN GRID ════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-6">

        {/* ── LEFT col ─────────────────────────────────────────────────── */}
        <div className="col-span-2 space-y-6">

          {/* Nutrition cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Today's Nutrition</h2>
              <span className="text-gray-600 text-xs glass rounded-lg px-3 py-1">
                {consumed.calories === 0 ? 'No meals logged today — targets shown' : `${consumed.calories} kcal logged today`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <NutritionCard label="Calories" consumed={consumed.calories} target={avgTdee}
                unit="kcal" color="text-amber-400" barColor="bg-amber-500/70" />
              <NutritionCard label="Protein" consumed={consumed.protein} target={targetProtein}
                unit="g" color="text-blue-400" barColor="bg-blue-500/70" />
              <NutritionCard label="Carbs" consumed={consumed.carbs} target={targetCarbs}
                unit="g" color="text-purple-400" barColor="bg-purple-500/70" />
              <NutritionCard label="Fat" consumed={consumed.fat} target={targetFat}
                unit="g" color="text-rose-400" barColor="bg-rose-500/70" />
            </div>
          </div>

          {/* ── Streak heatmap ── */}
          {/* ── CTA button ── */}
          <button
            onClick={() => navigate('/scan')}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3
              bg-gradient-to-r from-emerald-600 to-emerald-500
              hover:from-emerald-500 hover:to-emerald-400
              text-gray-950 font-black text-base
              shadow-xl shadow-emerald-900/40
              transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
            🍽️ Let's Build a Meal
          </button>

          {/* ── Streak heatmap ── */}
          <div className="glass rounded-3xl p-6">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-bold text-base">Goal Streak</h2>
                {currentStreak > 0 && (
                  <span className="streak-fire px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30
                    text-orange-400 text-xs font-black flex items-center gap-1">
                    🔥 {currentStreak} day{currentStreak !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-xs">
                  Longest: <span className="text-emerald-400 font-black">{longestStreak}</span>
                </span>
                <span className="text-gray-600 text-xs">
                  Total: <span className="text-white font-bold">{goalDays.length}</span> days
                </span>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="bg-white/6 border border-white/10 rounded-lg px-2 py-1 text-xs
                    text-white cursor-pointer outline-none focus:border-emerald-500/50"
                >
                  {allYears.map(y => (
                    <option key={y} value={y} className="bg-[#0b0f14]">{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Single-row horizontal scroll — all 12 months side by side */}
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {monthGrids.map(({ month, days }) => (
                <div key={month} className="flex-shrink-0">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 text-center">{month}</p>
                  <div className="grid grid-cols-7 gap-px mb-px">
                    {['M','T','W','T','F','S','S'].map((d,i) => (
                      <div key={i} className="w-3 text-[7px] text-gray-700 text-center">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-px">
                    {days.map((day, di) => {
                      const d = day.date ? new Date(day.date + 'T00:00:00') : null;
                      const label = d ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '';
                      let base = '';
                      switch (day.status) {
                        case 'met':
                          base = 'bg-emerald-500 shadow-md shadow-emerald-900/40 hover:bg-emerald-400';
                          break;
                        case 'dark':
                          base = 'bg-orange-500 shadow-md shadow-orange-900/40 hover:bg-orange-400';
                          break;
                        case 'light':
                          base = 'bg-orange-600/60 hover:bg-orange-500/80 border border-orange-400/20';
                          break;
                        default:
                          base = 'bg-white/10 hover:bg-white/20 border border-white/5';
                          break;
                      }

                      if (day.isToday) {
                        if (day.status === 'blank') base = 'bg-white/20 hover:bg-white/30 border border-white/10';
                        base += ' ring-[1px] ring-offset-[#0b0f14] ring-offset-1 ring-white/50';
                      }

                      const dayCss = !day.date ? 'invisible group relative w-3 h-3 rounded-sm' : `${base} cursor-pointer relative w-3 h-3 rounded-sm transition-all duration-200 group`;

                      const tipBg = day.status === 'met' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-400' 
                                  : day.status !== 'blank' ? 'bg-orange-950/90 border-orange-500/40 text-orange-400' 
                                  : 'bg-[#0d1117] border-white/10 text-gray-400';
                      
                      const tipArrow = day.status === 'met' ? 'border-t-emerald-900/90' 
                                     : day.status !== 'blank' ? 'border-t-orange-900/90' 
                                     : 'border-t-[#0d1117]';

                      return (
                        <div key={di} className={dayCss}>
                          {/* CSS Hover Tooltip */}
                          {day.date && (
                            <div className="absolute bottom-full left-1/2 -ml-[1px] -translate-x-1/2 mb-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[100]">
                              <div className="flex flex-col items-center">
                                <div className={`px-3 py-2 rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md border whitespace-nowrap ${tipBg}`}>
                                  <span className={`block font-black text-[11px] ${day.status !== 'blank' ? 'text-white' : 'text-gray-300'}`}>{label}</span>
                                  <span className="block text-[10px] mt-0.5 font-bold text-center">
                                    {day.status === 'met' ? '✅ Goal met' : day.status !== 'blank' ? `⏳ ${day.cals} kcal logged` : 'No goal logged'}
                                  </span>
                                </div>
                                <div className={`w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent ${tipArrow}`} />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>



        {/* ── RIGHT: Profile panel ─────────────────────────────────────── */}
        <div className="col-span-1 space-y-4">
          <h2 className="text-white font-bold text-lg">Active Profiles</h2>

          {activeProfiles.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center text-gray-600 text-sm">No profiles selected</div>
          ) : (
            activeProfiles.map(p => {
              const bmr = p.gender === 'Female'
                ? 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
                : 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
              const tdee = Math.round(bmr * 1.375);
              const bmi  = p.weight / ((p.height / 100) ** 2);
              return (
                <div key={p.id} className="glass rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-900/30 to-transparent px-5 py-4 flex items-center gap-3 border-b border-white/5">
                    <span className="text-3xl">{p.avatar}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.age}y · {p.gender}</p>
                    </div>
                    <button onClick={() => setEditingProfile(p)} title="Edit profile"
                      className="w-8 h-8 rounded-xl bg-white/6 hover:bg-emerald-500/20
                        border border-white/8 hover:border-emerald-500/40
                        flex items-center justify-center text-gray-500
                        hover:text-emerald-400 transition-all cursor-pointer text-sm">✏️</button>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-y divide-white/5">
                    {[
                      { l:'Weight', v:`${p.weight}`, u:'kg' },
                      { l:'Height', v:`${p.height}`, u:'cm' },
                      { l:'BMI',    v:bmi.toFixed(1), u:bmi < 18.5?'Under':bmi<25?'Normal':'Over' },
                      { l:'TDEE',   v:`${tdee}`,      u:'kcal/d' },
                    ].map(({l,v,u}) => (
                      <div key={l} className="px-4 py-3">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">{l}</p>
                        <p className="text-white font-black text-base">{v}</p>
                        <p className="text-gray-600 text-[10px]">{u}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {isGroup && (
            <div className="glass rounded-2xl px-5 py-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Group avg. TDEE</p>
              <p className="text-emerald-400 font-black text-2xl">{avgTdee}</p>
              <p className="text-gray-600 text-xs">kcal / person / day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

