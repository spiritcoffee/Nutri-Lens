import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import type { NutriProfile } from '../context/authContext';

/* ── Avatar colours — cycled by profile index ──────────────────────── */
const RING_COLOURS = [
  'ring-emerald-400 shadow-emerald-500/40',
  'ring-sky-400    shadow-sky-500/40',
  'ring-violet-400 shadow-violet-500/40',
  'ring-rose-400   shadow-rose-500/40',
  'ring-amber-400  shadow-amber-500/40',
];

/* ── Single profile card ────────────────────────────────────────────── */
const ProfileCard = ({
  profile,
  index,
  editMode,
  onSelect,
  onDelete,
}: {
  profile: NutriProfile;
  index: number;
  editMode: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  const ring = RING_COLOURS[index % RING_COLOURS.length];

  return (
    <div className="profile-card group flex flex-col items-center gap-3 cursor-pointer select-none">
      <div className="relative" onClick={editMode ? undefined : onSelect}>
        {/* Avatar circle */}
        <div
          className={`
            w-28 h-28 rounded-full flex items-center justify-center text-5xl
            bg-gray-800 border-2 border-gray-700
            transition-all duration-300 ease-out
            group-hover:scale-110 group-hover:ring-4 group-hover:shadow-xl
            ${ring}
          `}
        >
          {profile.avatar}
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
        className="text-white font-semibold text-sm tracking-wide truncate max-w-[7rem] text-center"
        onClick={editMode ? undefined : onSelect}
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
    <div
      className="
        w-28 h-28 rounded-full flex items-center justify-center
        border-2 border-dashed border-gray-600 bg-gray-800/40
        transition-all duration-300 ease-out
        group-hover:border-green-500 group-hover:bg-green-500/10 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-green-500/20
      "
    >
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
  const { profiles, setActiveProfile, deleteProfile, user } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);

  const handleSelect = (profile: NutriProfile) => {
    if (editMode) return;
    setActiveProfile(profile);
    navigate('/home', { replace: true });
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    if (profiles.length <= 1) setEditMode(false);
  };

  const canAddMore = profiles.length < 5;

  return (
    <div className="profile-selector-bg relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">

      {/* ── Ambient radial glow ─────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-600/10 blur-[120px]" />
      </div>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center mb-14 text-center">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-6 opacity-80">
          <span className="text-2xl">🥗</span>
          <span className="text-green-400 font-bold text-xl tracking-tight">Nutri-Lens</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
          Who's tracking today?
        </h1>
        {user && (
          <p className="text-gray-500 text-sm mt-1">
            Signed in as <span className="text-gray-400">{user.email}</span>
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
            editMode={editMode}
            onSelect={() => handleSelect(profile)}
            onDelete={() => handleDelete(profile.id)}
          />
        ))}

        {/* Add Profile card */}
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

      {/* ── Footer actions ──────────────────────────────────────────── */}
      <div className="relative z-10 mt-14 flex items-center gap-5">
        {profiles.length > 0 && (
          <button
            id="btn-manage-profiles"
            onClick={() => setEditMode((v) => !v)}
            className={`
              px-5 py-2 rounded-lg border text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer
              ${editMode
                ? 'border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                : 'border-gray-700 bg-transparent text-gray-400 hover:border-gray-500 hover:text-white'}
            `}
          >
            {editMode ? '✓ Done' : '✏ Manage Profiles'}
          </button>
        )}
      </div>

      {/* ── Edit mode banner ────────────────────────────────────────── */}
      {editMode && (
        <div className="relative z-10 mt-6 px-5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          Tap the × on a profile to remove it
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
