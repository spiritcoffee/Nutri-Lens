import { useAuth } from '../context/useAuth';

const Profile = () => {
  const { activeProfiles } = useAuth();

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
          <h1 className="text-3xl font-black text-white tracking-tight">Profile & Stats</h1>
          <p className="text-gray-500 text-sm mt-1">
            BMI, TDEE, and body metrics for each tracked person
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
            const bmi   = p.weight / ((p.height / 100) ** 2);
            const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
            const bmiColor = bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-emerald-400' : bmi < 30 ? 'text-amber-400' : 'text-red-400';
            const bmr  = p.gender === 'Female'
              ? 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
              : 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
            const tdee = Math.round(bmr * 1.375);
            const protein = Math.round(p.weight * 1.6);
            const fat    = Math.round(tdee * 0.25 / 9);
            const carbs  = Math.round((tdee - protein * 4 - fat * 9) / 4);

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
          Detailed history and goal tracking will appear here as you log meals.
        </p>
      </div>
    </div>
  );
};

export default Profile;
