import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

/* ── Mini stat card ──────────────────────────────────────────────────── */
const Stat = ({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) => (
  <div className="glass glass-hover rounded-2xl p-5 flex flex-col gap-2 cursor-default transition-all duration-200 group">
    <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">{label}</span>
    <div className="flex items-end gap-1.5">
      <span className={`text-3xl font-black ${color}`}>{value}</span>
      <span className="text-gray-600 text-xs mb-1">{unit}</span>
    </div>
    <div className="h-1 rounded-full bg-white/5">
      <div className={`h-1 rounded-full w-0 group-hover:w-full transition-all duration-700 ${color.replace('text-','bg-')}/30`} />
    </div>
  </div>
);

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
  const { activeProfiles } = useAuth();
  const navigate = useNavigate();

  const isGroup  = activeProfiles.length > 1;
  const primary  = activeProfiles[0];

  /* Rough TDEE per profile */
  const avgTdee = activeProfiles.length
    ? Math.round(activeProfiles.reduce((sum, p) => {
        const bmr = p.gender === 'Female'
          ? 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
          : 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
        return sum + bmr * 1.375;
      }, 0) / activeProfiles.length)
    : 0;

  return (
    <div className="page-enter space-y-8">

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

          {/* Stat row */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Today's Nutrition</h2>
              <span className="text-gray-600 text-xs glass rounded-lg px-3 py-1">No scans yet today</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Stat label="Calories" value="—" unit="kcal" color="text-amber-400" />
              <Stat label="Protein"  value="—" unit="g"    color="text-blue-400"  />
              <Stat label="Carbs"    value="—" unit="g"    color="text-purple-400"/>
              <Stat label="Fat"      value="—" unit="g"    color="text-rose-400"  />
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
                    <div>
                      <p className="text-white font-bold text-sm">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.age}y · {p.gender}</p>
                    </div>
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
