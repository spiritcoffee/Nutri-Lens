import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const { activeProfiles } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-enter space-y-8">

      {/* ══ HEADER ══════════════════════════════════════════════════ */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">📋 History</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your past ingredient scans and nutrition logs
          </p>
        </div>
        <button onClick={() => navigate('/scan')}
          className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400
            active:scale-[0.98] text-gray-950 font-bold text-sm transition-all
            duration-150 cursor-pointer shadow-lg shadow-emerald-900/40">
          + New Scan
        </button>
      </div>

      {/* ══ ACTIVE PROFILES STRIP ═══════════════════════════════════ */}
      {activeProfiles.length > 0 && (
        <div className="glass rounded-2xl px-5 py-4 flex items-center gap-3">
          <div className="flex -space-x-2">
            {activeProfiles.map((p, i) => (
              <span key={p.id} style={{ zIndex: activeProfiles.length - i }}
                className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#070a0e]
                  flex items-center justify-center text-base">
                {p.avatar}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            Showing history for{' '}
            <span className="text-white font-semibold">
              {activeProfiles.map(p => p.name.split(' ')[0]).join(', ')}
            </span>
          </p>
        </div>
      )}

      {/* ══ EMPTY STATE ═════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main empty state */}
        <div className="col-span-2 glass rounded-3xl p-16 flex flex-col items-center
          justify-center text-center">
          <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center
            text-4xl mb-6 border border-white/8">
            📷
          </div>
          <h2 className="text-white font-black text-xl mb-2">No scans yet</h2>
          <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
            Scan your first meal to start tracking nutrition history.
            Upload a food photo or pick ingredients manually.
          </p>
          <button onClick={() => navigate('/scan')}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400
              active:scale-[0.98] text-gray-950 font-bold text-sm transition-all
              duration-150 cursor-pointer shadow-lg shadow-emerald-900/40">
            Scan a meal →
          </button>
        </div>

        {/* Side info cards */}
        <div className="col-span-1 space-y-4">
          <div className="glass rounded-2xl p-5">
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.15em] font-bold mb-3">
              Coming soon
            </p>
            <div className="space-y-3">
              {[
                { icon: '📊', text: 'Daily calorie timeline' },
                { icon: '🧮', text: 'Weekly macro breakdown' },
                { icon: '🥗', text: 'Most-used ingredients'  },
                { icon: '🎯', text: 'Goal vs actual tracking' },
                { icon: '📅', text: 'Meal calendar view'     },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl px-5 py-4">
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.15em] font-bold mb-2">
              How it works
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              Every time you tap <strong className="text-gray-400">Next →</strong> on
              the Ingredients screen, that scan is saved here with a timestamp, ingredient
              list, and calculated macros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
