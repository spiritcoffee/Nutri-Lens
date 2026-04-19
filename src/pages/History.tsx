import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const { activeProfiles, history, rateHistoryEntry } = useAuth();
  const navigate = useNavigate();

  const activeIds = new Set(activeProfiles.map(p => p.id));
  const visibleHistory = history.filter(e => e.profileIds.some(id => activeIds.has(id)));

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

      {/* ══ CONTENT ═════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main section: History Feed or Empty State */}
        <div className="lg:col-span-2 space-y-4">
          {visibleHistory.length === 0 ? (
            <div className="glass rounded-3xl p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center text-4xl mb-6 border border-white/8">
                📷
              </div>
              <h2 className="text-white font-black text-xl mb-2">No meals selected yet</h2>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
                Scan ingredients and pick a recommended meal to start tracking your nutrition history!
              </p>
              <button onClick={() => navigate('/scan')}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400
                  active:scale-[0.98] text-gray-950 font-bold text-sm transition-all
                  duration-150 cursor-pointer shadow-lg shadow-emerald-900/40">
                Scan ingredients →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleHistory.map((entry) => (
                <div key={entry.id} className="glass rounded-2xl p-6 border border-white/6 hover:border-white/15 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{entry.mealName}</h3>
                      <p className="text-xs text-gray-500 font-medium tracking-wide">
                        {new Date(entry.timestamp).toLocaleString(undefined, {
                          weekday: 'long', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      
                      {/* ⭐ Interactive Star Rating ⭐ */}
                      <div className="flex items-center gap-1 mt-3">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => rateHistoryEntry(entry.id, star)}
                            className={`text-2xl transition-all hover:scale-125 cursor-pointer leading-none ${
                              entry.rating && entry.rating >= star
                                ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                : 'text-gray-700 hover:text-amber-400/50'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                        {entry.rating ? (
                          <span className="ml-3 text-[10px] font-black uppercase tracking-wider text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-lg">Rated {entry.rating}/5</span>
                        ) : (
                          <span className="ml-3 text-[10px] uppercase font-bold tracking-wider text-gray-600">Rate this recipe</span>
                        )}
                      </div>
                      
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="bg-emerald-500/10 text-emerald-400 font-black text-lg px-3 py-1 rounded-xl">
                        {entry.calories} kcal
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/6">
                    <p className="text-[10px] uppercase font-bold text-gray-600 tracking-wider mb-2">Ingredients Used</p>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.ingredients.map(ing => (
                        <span key={ing} className="px-2 py-1 rounded-md bg-white/4 border border-white/6 text-gray-400 text-xs text-center">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side info cards */}
        <div className="col-span-1 space-y-4">
          <div className="glass rounded-2xl px-5 py-4">
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.15em] font-bold mb-2">
              How it works
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              Every time you tap <strong className="text-emerald-400">Select & Eat This ✓</strong> on
              a generated meal recommendation, that meal is saved here to your history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
