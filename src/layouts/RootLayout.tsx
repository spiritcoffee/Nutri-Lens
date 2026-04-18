import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const NAV = [
  { to: '/home',    icon: '⊞',  label: 'Dashboard' },
  { to: '/scan',    icon: '⊙',  label: 'Ingredients' },
  { to: '/history', icon: '◷',  label: 'History'   },
  { to: '/profile', icon: '◉',  label: 'Stats'     },
];

const RootLayout = () => {
  const { user, logout, activeProfiles, clearActiveProfiles } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleSwitch = () => { clearActiveProfiles(); setMenuOpen(false); navigate('/profile-select', { replace: true }); };

  const visibleAvatars = activeProfiles.slice(0, 3);
  const overflow = activeProfiles.length - 3;

  const pageTitle = NAV.find(n => location.pathname.startsWith(n.to))?.label ?? 'Nutri-Lens';

  return (
    <div className="min-h-screen bg-[#070a0e] text-white flex flex-col">

      {/* ══ TOP NAVBAR ═══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-8 h-[62px] flex items-center gap-8">

          {/* Brand */}
          <NavLink to="/home" className="flex items-center gap-3 flex-shrink-0 group">
            <img src="/logo.png" alt="Nutri-Lens Logo" className="w-9 h-9 rounded-[8px] shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105" />
            <span className="font-black text-lg text-white tracking-tight group-hover:text-emerald-400 transition-colors">
              Nutri-Lens
            </span>
          </NavLink>

          {/* ── Nav links ── */}
          <nav className="flex items-center gap-1 flex-1">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ── Page title ── */}
          <span className="hidden xl:block text-gray-600 text-sm font-medium">{pageTitle}</span>

          {/* ── Profile avatar pill ── */}
          {user && activeProfiles.length > 0 && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                id="btn-avatar-menu"
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2.5 rounded-2xl pl-1.5 pr-4 py-1.5 glass glass-hover border border-white/8 transition-all duration-200 cursor-pointer"
              >
                {/* Stacked avatars */}
                <span className="flex -space-x-2">
                  {visibleAvatars.map((p, i) => (
                    <span key={p.id} style={{ zIndex: visibleAvatars.length - i }}
                      className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#070a0e] flex items-center justify-center text-base ring-1 ring-emerald-500/30">
                      {p.avatar}
                    </span>
                  ))}
                  {overflow > 0 && (
                    <span className="w-8 h-8 rounded-full bg-emerald-900 border-2 border-[#070a0e] flex items-center justify-center text-xs font-bold text-emerald-400">
                      +{overflow}
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold text-white">
                  {activeProfiles.length === 1
                    ? activeProfiles[0].name.split(' ')[0]
                    : `${activeProfiles.length} profiles`}
                </span>
                <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 16 16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4"/>
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0e1117] border border-white/8 shadow-2xl shadow-black/60 overflow-hidden z-50">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-bold mb-3">Tracking for</p>
                    <div className="space-y-2.5">
                      {activeProfiles.map(p => (
                        <div key={p.id} className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-gray-800 border border-white/8 flex items-center justify-center text-xl flex-shrink-0">{p.avatar}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.age}y · {p.gender} · {p.weight}kg · {p.height}cm</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {user && <p className="text-xs text-gray-600 mt-3 truncate">{user.email}</p>}
                  </div>

                  {/* Actions */}
                  <div className="py-1.5">
                    <button onClick={handleSwitch}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      <span className="w-7 h-7 rounded-lg bg-emerald-900/40 flex items-center justify-center text-base">🔀</span>
                      Switch Profiles
                    </button>
                    <div className="mx-4 my-1 border-t border-white/5" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/8 hover:text-red-300 transition-colors cursor-pointer">
                      <span className="w-7 h-7 rounded-lg bg-red-900/30 flex items-center justify-center text-base">🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ══ MAIN ════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
