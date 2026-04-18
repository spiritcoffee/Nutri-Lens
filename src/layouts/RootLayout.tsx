import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const navItems = [
  { to: '/home',    label: 'Home'    },
  { to: '/scan',    label: 'Scan'    },
  { to: '/history', label: 'History' },
];

const RootLayout = () => {
  const { user, logout, activeProfile, clearActiveProfile } = useAuth();
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
    clearActiveProfile();
    setMenuOpen(false);
    navigate('/profile-select', { replace: true });
  };

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

            {/* Active profile avatar + dropdown */}
            {user && activeProfile && (
              <div className="relative ml-3" ref={menuRef}>
                <button
                  id="btn-avatar-menu"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full pl-2 pr-3 py-1 bg-gray-800 hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                >
                  {/* Active profile emoji */}
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-xl bg-gray-700 ring-2 ring-green-500/50">
                    {activeProfile.avatar}
                  </span>
                  <span className="text-sm font-medium text-white max-w-[100px] truncate hidden sm:block">
                    {activeProfile.name.split(' ')[0]}
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
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-700 bg-gray-900 shadow-xl shadow-black/40 overflow-hidden">
                    {/* Profile info */}
                    <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
                      <span className="text-2xl">{activeProfile.avatar}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{activeProfile.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <NavLink
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <span>👤</span> My Stats
                    </NavLink>

                    <button
                      id="btn-switch-profile"
                      onClick={handleSwitchProfile}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
                    >
                      <span>🔀</span> Switch Profile
                    </button>

                    <div className="border-t border-gray-800" />

                    <button
                      id="btn-logout"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <span>🚪</span> Sign out
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
