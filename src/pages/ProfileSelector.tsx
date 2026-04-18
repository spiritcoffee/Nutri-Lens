import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useState } from 'react';
import type { NutriProfile } from '../context/authContext';

/* ── Avatar ring colours — cycled by index ─────────────────────────── */
const RING_COLOURS = [
  'ring-emerald-400 shadow-emerald-500/40',
  'ring-sky-400     shadow-sky-500/40',
  'ring-violet-400  shadow-violet-500/40',
  'ring-rose-400    shadow-rose-500/40',
  'ring-amber-400   shadow-amber-500/40',
];

/* ── Checkmark SVG ──────────────────────────────────────────────────── */
const Checkmark = () => (
  <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
    <svg
      className="w-10 h-10 text-green-400 drop-shadow-lg"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

/* ── Single profile card ────────────────────────────────────────────── */
const ProfileCard = ({
  profile,
  index,
  isSelected,
  editMode,
  onToggle,
  onDelete,
}: {
  profile: NutriProfile;
  index: number;
  isSelected: boolean;
  editMode: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  const ring = RING_COLOURS[index % RING_COLOURS.length];

  return (
    <div
      className="profile-card group flex flex-col items-center gap-3 select-none"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative cursor-pointer" onClick={editMode ? undefined : onToggle}>
        {/* Avatar circle */}
        <div
          className={`
            w-28 h-28 rounded-full flex items-center justify-center text-5xl
            bg-gray-800 border-2 transition-all duration-300 ease-out
            ${isSelected
              ? `border-green-500 ring-4 shadow-xl scale-110 ${ring}`
              : 'border-gray-700 group-hover:scale-105 group-hover:ring-4 group-hover:shadow-lg ' + ring}
          `}
        >
          {profile.avatar}
          {/* Checkmark overlay when selected */}
          {isSelected && <Checkmark />}
        </div>

        {/* Edit mode — delete badge */}
        {editMode && (
          <button
            id={`btn-delete-profile-${profile.id}`}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white text-base font-bold shadow-lg transition-all duration-150 hover:scale-110 cursor-pointer"
            aria-label={`Delete ${profile.name}`}
          >
            ×
          </button>
        )}
      </div>

      {/* Name label */}
      <span
        className={`text-sm font-semibold tracking-wide truncate max-w-[7rem] text-center transition-colors duration-200 cursor-pointer
          ${isSelected ? 'text-green-400' : 'text-white group-hover:text-green-300'}`}
        onClick={editMode ? undefined : onToggle}
      >
        {profile.name}
      </span>
    </div>
  );
};

/* ── Add Profile card ───────────────────────────────────────────────── */
const AddCard = ({ onClick }: { onClick: () => void }) => (
  <div
    className="group flex flex-col items-center gap-3 cursor-pointer select-none"
    onClick={onClick}
    id="btn-add-profile"
  >
    <div className="
      w-28 h-28 rounded-full flex items-center justify-center
      border-2 border-dashed border-gray-600 bg-gray-800/40
      transition-all duration-300 ease-out
      group-hover:border-green-500 group-hover:bg-green-500/10 group-hover:scale-110
      group-hover:shadow-xl group-hover:shadow-green-500/20
    ">
      <svg
        className="w-10 h-10 text-gray-500 group-hover:text-green-400 transition-colors duration-300"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </div>
    <span className="text-gray-500 group-hover:text-green-400 font-semibold text-sm tracking-wide transition-colors duration-300">
      Add Profile
    </span>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════ */
const ProfileSelector = () => {
  const { profiles, activeProfiles, toggleActiveProfile, deleteProfile, setActiveProfiles, logout, user } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);

  const isSelected = (id: string) => activeProfiles.some((ap) => ap.id === id);

  const handleDelete = (id: string) => {
    deleteProfile(id);
    if (profiles.length <= 1) setEditMode(false);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleLetsGo = () => {
    navigate('/home', { replace: true });
  };

  // Select all / deselect all shortcut
  const handleSelectAll = () => {
    if (activeProfiles.length === profiles.length) {
      setActiveProfiles([]);
    } else {
      setActiveProfiles([...profiles]);
    }
  };

  const selectedCount = activeProfiles.length;
  const canAddMore = profiles.length < 5;
  const allSelected = profiles.length > 0 && activeProfiles.length === profiles.length;

  return (
    <div className="profile-selector-bg relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-12">

      {/* ── Ambient radial glow ─────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-green-600/10 blur-[140px]" />
      </div>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center mb-12 text-center">
        <div className="flex items-center gap-2 mb-6 opacity-80">
          <span className="text-2xl">🥗</span>
          <span className="text-green-400 font-bold text-xl tracking-tight">Nutri-Lens</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
          Who's eating today?
        </h1>
        <p className="text-gray-500 text-sm mt-1 max-w-xs">
          Select one or more profiles — recommendations will be tailored for everyone.
        </p>
        {user && (
          <p className="text-gray-600 text-xs mt-2">
            {user.email}
          </p>
        )}
      </div>

      {/* ── Profile cards ───────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-wrap items-end justify-center gap-8 sm:gap-12">
        {profiles.map((profile, i) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            index={i}
            isSelected={isSelected(profile.id)}
            editMode={editMode}
            onToggle={() => toggleActiveProfile(profile)}
            onDelete={() => handleDelete(profile.id)}
          />
        ))}

        {canAddMore && !editMode && (
          <AddCard onClick={() => navigate('/create-profile')} />
        )}
      </div>

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {profiles.length === 0 && (
        <p className="relative z-10 mt-6 text-gray-600 text-sm">
          Create your first profile to get started.
        </p>
      )}

      {/* ── Let's Go CTA ────────────────────────────────────────────── */}
      {selectedCount > 0 && !editMode && (
        <div className="relative z-10 mt-10 flex flex-col items-center gap-2">
          <button
            id="btn-lets-go"
            onClick={handleLetsGo}
            className="group flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-green-500 hover:bg-green-400 active:scale-[0.97] text-gray-950 font-bold text-base tracking-wide transition-all duration-200 shadow-xl shadow-green-900/40 cursor-pointer"
          >
            {/* Stacked mini avatars */}
            <span className="flex -space-x-2">
              {activeProfiles.slice(0, 3).map((p) => (
                <span
                  key={p.id}
                  className="w-7 h-7 rounded-full bg-gray-800 border-2 border-green-400 flex items-center justify-center text-base leading-none"
                >
                  {p.avatar}
                </span>
              ))}
              {activeProfiles.length > 3 && (
                <span className="w-7 h-7 rounded-full bg-gray-900 border-2 border-green-400 flex items-center justify-center text-xs text-green-400 font-bold">
                  +{activeProfiles.length - 3}
                </span>
              )}
            </span>
            <span>
              {selectedCount === 1
                ? "Let's go →"
                : `${selectedCount} people → Let's go`}
            </span>
          </button>
        </div>
      )}

      {/* ── Footer actions ──────────────────────────────────────────── */}
      <div className="relative z-10 mt-8 flex items-center flex-wrap justify-center gap-3">
        {/* Select all / none — only when not in edit mode and has profiles */}
        {profiles.length > 1 && !editMode && (
          <button
            id="btn-select-all"
            onClick={handleSelectAll}
            className="px-4 py-1.5 rounded-lg border border-gray-700 bg-transparent text-gray-500 hover:border-gray-500 hover:text-gray-300 text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        )}

        {profiles.length > 0 && (
          <button
            id="btn-manage-profiles"
            onClick={() => setEditMode((v) => !v)}
            className={`
              px-4 py-1.5 rounded-lg border text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer
              ${editMode
                ? 'border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                : 'border-gray-700 bg-transparent text-gray-500 hover:border-gray-500 hover:text-gray-300'}
            `}
          >
            {editMode ? '✓ Done' : '✏ Manage'}
          </button>
        )}

        <button
          id="btn-signout-selector"
          onClick={handleSignOut}
          className="px-4 py-1.5 rounded-lg border border-gray-800 bg-transparent text-gray-600 hover:border-red-500/50 hover:text-red-400 text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer"
        >
          🚪 Sign Out
        </button>
      </div>

      {/* ── Edit mode banner ────────────────────────────────────────── */}
      {editMode && (
        <div className="relative z-10 mt-4 px-5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          Tap the × on a profile to remove it
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
