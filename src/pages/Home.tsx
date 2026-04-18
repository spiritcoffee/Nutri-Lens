import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import type { NutriProfile, NutriGoal, DietaryPref } from '../context/authContext';

/* ── AVATARS ── */
const AVATARS = ['👤','👦','👧','👨','👩','👴','👵','🧑','👨‍🍳','👩‍🍳','🏃','🧘'];
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

/* ── Action tile ─────────────────────────────────────────────────────── */
const Action = ({ icon, title, desc, label, onClick, accent }: {
  icon: string; title: string; desc: string; label: string; onClick: () => void; accent: string;
}) => (
  <button onClick={onClick} className={`glass glass-hover rounded-2xl p-6 text-left
    hover:scale-[1.015] active:scale-[0.99] transition-all duration-200 cursor-pointer
    border-l-4 ${accent} w-full group`}>
    <span className="text-3xl mb-4 block">{icon}</span>
    <p className="text-white font-bold text-base mb-1">{title}</p>
    <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400
      group-hover:gap-2 transition-all duration-200">
      {label} <span>→</span>
    </span>
  </button>
);

/* ════════════════════════════════════════════════════════════════════════ */
const Home = () => {
  const { activeProfiles, updateProfile, history } = useAuth();
  const navigate = useNavigate();
  const [editingProfile, setEditingProfile] = useState<NutriProfile | null>(null);

  const isGroup = activeProfiles.length > 1;
  const primary = activeProfiles[0];

  /* ── Avg TDEE across all active profiles ── */
  const avgTdee = activeProfiles.length
    ? Math.round(activeProfiles.reduce((sum, p) => {
        const bmr = p.gender === 'Female'
          ? 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
          : 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
        return sum + bmr * 1.375;
      }, 0) / activeProfiles.length)
    : 2000;

  /* ── Daily macro targets derived from TDEE ── */
  // Protein: 1.6g per avg kg of body weight
  // Fat: 25% of TDEE
  // Carbs: remainder
  const avgWeight = activeProfiles.length
    ? Math.round(activeProfiles.reduce((s, p) => s + p.weight, 0) / activeProfiles.length)
    : 70;
  const targetProtein = Math.round(avgWeight * 1.6);
  const targetFat     = Math.round((avgTdee * 0.25) / 9);
  const targetCarbs   = Math.round((avgTdee - targetProtein * 4 - targetFat * 9) / 4);

  /* ── Today's consumed — sum from history logged today ── */
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const todayMs = todayStart.getTime();

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

  return (
    <div className="page-enter space-y-8">

      {/* Edit modal */}
      {editingProfile && (
        <EditModal
          profile={editingProfile}
          onSave={updateProfile}
          onClose={() => setEditingProfile(null)}
        />
      )}

      {/* ══ HERO BANNER ════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden h-[260px]">
        <img src="/hero-food.png" alt="food"
          className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070a0e]/85 via-[#070a0e]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a0e]/60 to-transparent" />

        {/* Text */}
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

        {/* Scan CTA pill */}
        <div className="absolute top-6 right-6">
          <button onClick={() => navigate('/scan')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full
              bg-emerald-500 hover:bg-emerald-400 active:scale-95
              text-gray-950 font-bold text-sm transition-all duration-150 cursor-pointer
              shadow-xl shadow-emerald-900/50">
            📷 Scan Food
          </button>
        </div>
      </div>

      {/* ══ MAIN GRID ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-6">

        {/* ── LEFT: Today's stats ─────────────────────────────────────── */}
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
              <NutritionCard
                label="Calories" consumed={consumed.calories} target={avgTdee}
                unit="kcal" color="text-amber-400" barColor="bg-amber-500/70" />
              <NutritionCard
                label="Protein" consumed={consumed.protein} target={targetProtein}
                unit="g" color="text-blue-400" barColor="bg-blue-500/70" />
              <NutritionCard
                label="Carbs" consumed={consumed.carbs} target={targetCarbs}
                unit="g" color="text-purple-400" barColor="bg-purple-500/70" />
              <NutritionCard
                label="Fat" consumed={consumed.fat} target={targetFat}
                unit="g" color="text-rose-400" barColor="bg-rose-500/70" />
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-white font-bold text-lg mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Action icon="📷" title="Detect Ingredients" label="Open scanner"
                desc="Upload a photo — AI detects ingredients and builds your nutrition list."
                onClick={() => navigate('/scan')} accent="border-emerald-500" />
              <Action icon="📋" title="Meal History" label="View logs"
                desc="Browse past scans, track your daily intake and eating patterns over time."
                onClick={() => navigate('/history')} accent="border-sky-500" />
            </div>
          </div>

          {/* Spices banner */}
          <div className="relative rounded-2xl overflow-hidden h-36">
            <img src="/spices-bg.png" alt="spices" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070a0e]/90 via-[#070a0e]/50 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 gap-8">
              <div>
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">
                  Indian cuisine
                </p>
                <p className="text-white font-black text-xl leading-tight">
                  16 masalas &<br/>pantry staples
                </p>
              </div>
              <button onClick={() => navigate('/scan')}
                className="ml-auto flex-shrink-0 px-5 py-2.5 rounded-2xl
                  bg-emerald-500 hover:bg-emerald-400 active:scale-95
                  text-gray-950 font-bold text-sm transition-all duration-150 cursor-pointer">
                Pick Ingredients →
              </button>
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
              const tdee  = Math.round(bmr * 1.375);
              const bmi   = p.weight / ((p.height / 100) ** 2);
              return (
                <div key={p.id} className="glass rounded-2xl overflow-hidden">
                  {/* Profile header */}
                  <div className="bg-gradient-to-r from-emerald-900/30 to-transparent px-5 py-4 flex items-center gap-3 border-b border-white/5">
                    <span className="text-3xl">{p.avatar}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.age}y · {p.gender}</p>
                    </div>
                    {/* Edit button */}
                    <button
                      onClick={() => setEditingProfile(p)}
                      title="Edit profile"
                      className="w-8 h-8 rounded-xl bg-white/6 hover:bg-emerald-500/20
                        border border-white/8 hover:border-emerald-500/40
                        flex items-center justify-center text-gray-500
                        hover:text-emerald-400 transition-all cursor-pointer text-sm"
                    >✏️</button>
                  </div>
                  {/* Stats */}
                  <div className="grid grid-cols-2 divide-x divide-y divide-white/5">
                    {[
                      { l:'Weight', v:`${p.weight}`, u:'kg'       },
                      { l:'Height', v:`${p.height}`, u:'cm'       },
                      { l:'BMI',    v:bmi.toFixed(1), u:bmi < 18.5?'Under':bmi<25?'Normal':'Over' },
                      { l:'TDEE',   v:`${tdee}`,      u:'kcal/d'  },
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

          {/* Avg TDEE if group */}
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
