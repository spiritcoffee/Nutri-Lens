import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const navItems = [
  { to: '/home',    label: 'Home'    },
  { to: '/scan',    label: 'Scan'    },
  { to: '/history', label: 'History' },
];

const RootLayout = () => {
  const { user, logout, activeProfiles, clearActiveProfiles } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSwitchProfile = () => {
    clearActiveProfiles();
    setMenuOpen(false);
    navigate('/profile-select', { replace: true });
  };

  /* ── Stacked avatar preview (up to 3 + overflow count) ─────────── */
  const visibleProfiles = activeProfiles.slice(0, 3);
  const overflowCount   = activeProfiles.length - 3;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Brand */}
          <NavLink
            to="/home"
            className="text-green-400 font-bold text-xl tracking-tight hover:text-green-300 transition-colors"
          >
            🥗 Nutri-Lens
          </NavLink>

          <div className="flex items-center gap-1">
            {/* Nav links */}
            <ul className="flex items-center gap-1">
              {navItems.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Stacked avatars + dropdown */}
            {user && activeProfiles.length > 0 && (
              <div className="relative ml-3" ref={menuRef}>
                <button
                  id="btn-avatar-menu"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 bg-gray-800 hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                >
                  {/* Stacked emoji avatars */}
                  <span className="flex -space-x-2">
                    {visibleProfiles.map((p, i) => (
                      <span
                        key={p.id}
                        style={{ zIndex: visibleProfiles.length - i }}
                        className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-lg ring-1 ring-green-500/40"
                      >
                        {p.avatar}
                      </span>
                    ))}
                    {overflowCount > 0 && (
                      <span
                        style={{ zIndex: 0 }}
                        className="w-8 h-8 rounded-full bg-gray-900 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-green-400 ring-1 ring-green-500/40"
                      >
                        +{overflowCount}
                      </span>
                    )}
                  </span>

                  {/* Name — first profile or "X people" */}
                  <span className="text-sm font-medium text-white hidden sm:block">
                    {activeProfiles.length === 1
                      ? activeProfiles[0].name.split(' ')[0]
                      : `${activeProfiles.length} people`}
                  </span>

                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="4 6 8 10 12 6" />
                  </svg>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl border border-gray-700 bg-gray-900 shadow-xl shadow-black/40 overflow-hidden">

                    {/* Active profiles list */}
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">
                        Tracking for
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {activeProfiles.map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <span className="text-xl">{p.avatar}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                              <p className="text-xs text-gray-500">
                                {p.age}y · {p.gender} · {p.weight}kg
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Menu items */}
                    <NavLink
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <span>📊</span> Nutrition Stats
                    </NavLink>

                    <button
                      id="btn-switch-profile"
                      onClick={handleSwitchProfile}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
                    >
                      <span>🔀</span> Switch Profiles
                    </button>

                    <div className="border-t border-gray-800" />

                    <button
                      id="btn-logout"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ── Page content ───────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
