import { useAuth } from '../context/useAuth';

/* ── SVG Radial Ring chart ─────────────────────────────── */
const Ring = ({
  value, max, color, size = 120, stroke = 12,
  label, unit,
}: {
  value: number; max: number; color: string;
  size?: number; stroke?: number; label: string; unit: string;
}) => {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(value / Math.max(max, 1), 1);
  const dash = pct * circ;
  const over = value > max;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Track */}
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={over ? '#ef4444' : color}
            strokeWidth={stroke}
            strokeDasharray={`${Math.min(dash, circ)} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-black ${over ? 'text-red-400' : 'text-white'}`}>
            {value}
          </span>
          <span className="text-[9px] text-gray-500 font-bold uppercase">{unit}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</p>
        <p className={`text-xs font-semibold mt-0.5 ${over ? 'text-red-400' : 'text-gray-400'}`}>
          {over ? `+${value - max} over` : `${max - value} remaining`} / {max} {unit}
        </p>
      </div>
    </div>
  );
};

/* ── Bar mini chart ────────────────────────────────────── */
const MiniBar = ({ label, consumed, target, color, unit }: {
  label: string; consumed: number; target: number; color: string; unit: string;
}) => {
  const pct = Math.min((consumed / Math.max(target, 1)) * 100, 100);
  const over = consumed > target;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-gray-400 text-xs font-medium">{label}</span>
        <span className={`text-sm font-black ${over ? 'text-red-400' : 'text-white'}`}>
          {consumed}<span className="text-gray-600 text-[10px] ml-0.5">{unit}</span>
          <span className="text-gray-600 text-[10px] ml-1">/ {target}{unit}</span>
        </span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${over ? 'bg-red-500' : color} rounded-full`}
          style={{ width: `${pct}%`, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
    </div>
  );
};

/* ── SVG Bar Chart for History ─────────────────────────── */
const DailyHistoryGraph = ({
  values, target, color, unit, height = 80
}: {
  values: { label: string; value: number }[];
  target: number; color: string; unit: string; height?: number;
}) => {
  const maxVal = Math.max(...values.map(v => v.value), target, 1);
  const barWidth = 24;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative" style={{ height: height + 20 }}>
        {/* Y-Axis Label (Target) */}
        <div className="absolute left-0 right-0 border-t border-white/10"
             style={{ top: `${(1 - target / maxVal) * height}px` }}>
          <span className="absolute -top-4 right-0 text-[8px] font-bold text-gray-500 uppercase tracking-tighter">
            Goal: {target}{unit}
          </span>
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-between px-1">
          {values.map((v, i) => {
            const h = (v.value / maxVal) * height;
            const isTargetMet = v.value >= target;
            return (
              <div key={i} className="group relative flex flex-col items-center">
                <div
                  className="rounded-t-md transition-all duration-500"
                  style={{
                    width: barWidth,
                    height: Math.max(h, 4),
                    backgroundColor: isTargetMet ? color : 'rgba(255,255,255,0.1)',
                    opacity: v.value === 0 ? 0.2 : 1
                  }}
                />
                <span className="text-[9px] text-gray-600 font-bold mt-2 uppercase tracking-tighter">
                  {v.label}
                </span>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <div className="bg-gray-900 border border-white/10 rounded-lg px-2 py-1 shadow-xl whitespace-nowrap">
                    <p className="text-[10px] text-white font-bold">{v.value} {unit}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════ */
const Profile = () => {
  const { activeProfiles, history } = useAuth();

  // Today's start in local time
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  // Helper to get last 7 days date strings
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
    };
  });

  return (
    <div className="page-enter space-y-8">

      {/* ══ HEADER ══════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden h-[200px]">
        <img src="/spices-bg.png" alt="spices" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070a0e]/90 via-[#070a0e]/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
            Nutrition Stats
          </p>
          <h1 className="text-3xl font-black text-white tracking-tight">Profile &amp; Stats</h1>
          <p className="text-gray-500 text-sm mt-1">
            BMI, TDEE, body metrics and daily intake for each tracked person
          </p>
        </div>
      </div>

      {/* ══ NO PROFILES ═════════════════════════════════════════════ */}
      {activeProfiles.length === 0 && (
        <div className="glass rounded-3xl p-16 text-center">
          <span className="text-5xl">👤</span>
          <p className="text-white font-bold text-lg mt-6">No active profiles</p>
          <p className="text-gray-500 text-sm mt-2">Go back and select profiles from the selector.</p>
        </div>
      )}

      {/* ══ PROFILE CARDS GRID ══════════════════════════════════════ */}
      {activeProfiles.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {activeProfiles.map(p => {
            const bmi      = p.weight / ((p.height / 100) ** 2);
            const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
            const bmiColor = bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-emerald-400' : bmi < 30 ? 'text-amber-400' : 'text-red-400';
            const bmr  = p.gender === 'Female'
              ? 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
              : 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
            const tdee    = Math.round(bmr * 1.375);
            const protein = Math.round(p.weight * 1.6);
            const fat     = Math.round(tdee * 0.25 / 9);
            const carbs   = Math.round((tdee - protein * 4 - fat * 9) / 4);

            // History for this profile
            const profileHistory = history.filter(e => e.profileIds.includes(p.id));

            // Today's consumed
            const todayEntries = profileHistory.filter(e => e.timestamp >= todayMs);
            const consumed = todayEntries.reduce(
              (acc, e) => ({
                calories: acc.calories + (e.calories ?? 0),
                protein:  acc.protein  + (e.protein  ?? 0),
                carbs:    acc.carbs    + (e.carbs    ?? 0),
                fat:      acc.fat      + (e.fat      ?? 0),
              }),
              { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );

            // 7-day data
            const dailyHistory = last7Days.map(day => {
              const start = new Date(day.dateStr + 'T00:00:00').getTime();
              const end   = start + 86400000;
              const entries = profileHistory.filter(e => e.timestamp >= start && e.timestamp < end);
              return {
                label: day.label,
                calories: entries.reduce((s, e) => s + (e.calories || 0), 0),
                protein: entries.reduce((s, e) => s + (e.protein || 0), 0)
              };
            });

            return (
              <div key={p.id} className="glass rounded-3xl overflow-hidden">
                {/* Card header */}
                <div className="bg-gradient-to-r from-emerald-900/40 via-emerald-900/10 to-transparent
                  px-7 py-6 border-b border-white/5 flex items-center gap-5">
                  <span className="w-16 h-16 rounded-2xl bg-gray-800 border border-white/8
                    flex items-center justify-center text-4xl">
                    {p.avatar}
                  </span>
                  <div>
                    <h2 className="text-white font-black text-xl">{p.name}</h2>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {p.age} years · {p.gender} · {p.weight}kg · {p.height}cm
                    </p>
                  </div>
                  <div className={`ml-auto px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    bmi < 25 ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                             : 'border-amber-500/40  text-amber-400  bg-amber-500/10'}`}>
                    BMI {bmi.toFixed(1)}
                  </div>
                </div>

                {/* Body stats row */}
                <div className="grid grid-cols-4 divide-x divide-white/5 border-b border-white/5">
                  {[
                    { label:'Weight', value:`${p.weight}`, unit:'kg' },
                    { label:'Height', value:`${p.height}`, unit:'cm' },
                    { label:'BMI',    value:bmi.toFixed(1), unit:bmiLabel, color: bmiColor },
                    { label:'TDEE',   value:`${tdee}`, unit:'kcal/day' },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label} className="px-5 py-5">
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-2">{label}</p>
                      <p className={`text-2xl font-black ${color ?? 'text-white'}`}>{value}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{unit}</p>
                    </div>
                  ))}
                </div>

                {/* ── Today's Intake ─────────────────────────────── */}
                <div className="px-7 py-6 border-b border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-bold mb-6">
                    Today's Intake
                  </p>
                  {todayEntries.length === 0 ? (
                    <div className="flex items-center gap-3 text-gray-600 text-sm py-2">
                      <span className="text-2xl">🍽️</span>
                      No meals logged today yet
                    </div>
                  ) : (
                    <>
                      {/* Ring charts for calories & protein */}
                      <div className="flex justify-around mb-6">
                        <Ring value={consumed.calories} max={tdee}    color="#10b981" label="Calories" unit="kcal" size={130} />
                        <Ring value={consumed.protein}  max={protein} color="#3b82f6" label="Protein"  unit="g"    size={130} />
                      </div>
                      {/* Bar charts for carbs & fat */}
                      <div className="space-y-3">
                        <MiniBar label="Carbs" consumed={consumed.carbs} target={carbs} color="bg-purple-500" unit="g" />
                        <MiniBar label="Fat"   consumed={consumed.fat}   target={fat}   color="bg-rose-500"   unit="g" />
                      </div>
                    </>
                  )}
                </div>

                {/* ── 7-Day Progress Graphs ──────────────────────── */}
                <div className="px-7 py-6 border-b border-white/5 bg-white/2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-bold mb-8">
                    Daily Progress (Last 7 Days)
                  </p>
                  <div className="space-y-12">
                    <div>
                      <DailyHistoryGraph
                        values={dailyHistory.map(d => ({ label: d.label, value: d.calories }))}
                        target={tdee}
                        color="#10b981"
                        unit="kcal"
                      />
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center mt-4">Calorie Intake</p>
                    </div>
                    <div>
                      <DailyHistoryGraph
                        values={dailyHistory.map(d => ({ label: d.label, value: d.protein }))}
                        target={protein}
                        color="#3b82f6"
                        unit="g"
                      />
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center mt-4">Protein Intake</p>
                    </div>
                  </div>
                </div>

                {/* Macro targets */}
                <div className="px-7 py-5 space-y-6">
                  {/* Daily */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-bold mb-4">
                      Est. Daily Macro Targets
                    </p>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label:'Calories', value:tdee,    unit:'kcal', bar:'bg-emerald-500', pct: 100 },
                        { label:'Protein',  value:protein, unit:'g',    bar:'bg-blue-500',    pct: Math.min(100, protein*4/tdee*100) },
                        { label:'Carbs',    value:carbs,   unit:'g',    bar:'bg-purple-500',  pct: Math.min(100, carbs*4/tdee*100)  },
                        { label:'Fat',      value:fat,     unit:'g',    bar:'bg-rose-500',    pct: Math.min(100, fat*9/tdee*100)    },
                      ].map(({ label, value, unit, bar, pct }) => (
                        <div key={label}>
                          <div className="flex items-baseline justify-between mb-1.5">
                            <span className="text-gray-400 text-xs font-medium">{label}</span>
                            <span className="text-white text-sm font-black">{value}<span className="text-gray-600 text-[10px] ml-0.5">{unit}</span></span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${bar} rounded-full opacity-80`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-bold mb-4">
                      Est. Weekly Macro Targets
                    </p>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label:'Calories', value:tdee*7,    unit:'kcal', bar:'bg-emerald-500', pct: 100 },
                        { label:'Protein',  value:protein*7, unit:'g',    bar:'bg-blue-500',    pct: Math.min(100, protein*4/tdee*100) },
                        { label:'Carbs',    value:carbs*7,   unit:'g',    bar:'bg-purple-500',  pct: Math.min(100, carbs*4/tdee*100)  },
                        { label:'Fat',      value:fat*7,     unit:'g',    bar:'bg-rose-500',    pct: Math.min(100, fat*9/tdee*100)    },
                      ].map(({ label, value, unit, bar, pct }) => (
                        <div key={label}>
                          <div className="flex items-baseline justify-between mb-1.5">
                            <span className="text-gray-400 text-xs font-medium">{label}</span>
                            <span className="text-white text-sm font-black">{value}<span className="text-gray-600 text-[10px] ml-0.5">{unit}</span></span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${bar} rounded-full opacity-80`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ NOTE ════════════════════════════════════════════════════ */}
      <div className="glass rounded-2xl px-6 py-4 flex items-start gap-3">
        <span className="text-lg mt-0.5">💡</span>
        <p className="text-gray-500 text-sm leading-relaxed">
          TDEE uses the <strong className="text-gray-400">Mifflin-St Jeor formula</strong> at a lightly active multiplier (×1.375).
          Macro targets use a 25% / 45% / 30% protein/carb/fat split.
          Rings turn <strong className="text-red-400">red</strong> when you exceed a target.
        </p>
      </div>
    </div>
  );
};


export default Profile;

