import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import type { NutriProfile } from '../context/authContext';

/* ── Available avatars ─────────────────────────────────────────────── */
const AVATARS = ['🧑', '👩', '👨', '🧒', '👧', '👦', '🧓', '🏃', '🧘', '💪', '🥗', '🍎'];

/* ── Simple uid helper ─────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10);

/* ── Form state type ───────────────────────────────────────────────── */
interface ProfileForm {
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  weight: string;
  height: string;
}

const INITIAL: ProfileForm = { name: '', age: '', gender: '', weight: '', height: '' };

/* ── Field wrapper ─────────────────────────────────────────────────── */
const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-green-400 tracking-wide uppercase">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-500">{hint}</p>}
  </div>
);

/* ── Shared input classes ──────────────────────────────────────────── */
const inputCls =
  'w-full rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-600 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 hover:border-gray-600';

/* ═══════════════════════════════════════════════════════════════════ */
const UserProfile = () => {
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [form, setForm] = useState<ProfileForm>(INITIAL);
  const [errors, setErrors] = useState<Partial<ProfileForm>>({});
  const { addProfile, profiles } = useAuth();
  const navigate = useNavigate();

  const set = (field: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const next: Partial<ProfileForm> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    const age = Number(form.age);
    if (!form.age || isNaN(age) || age < 1 || age > 120)
      next.age = 'Enter a valid age (1–120)';
    if (!form.gender) next.gender = 'Please select a gender';
    const wt = Number(form.weight);
    if (!form.weight || isNaN(wt) || wt < 1 || wt > 500)
      next.weight = 'Enter a valid weight (1–500 kg)';
    const ht = Number(form.height);
    if (!form.height || isNaN(ht) || ht < 30 || ht > 300)
      next.height = 'Enter a valid height (30–300 cm)';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (profiles.length >= 5) return; // safety guard

    const newProfile: NutriProfile = {
      id: uid(),
      avatar,
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender as NutriProfile['gender'],
      weight: Number(form.weight),
      height: Number(form.height),
    };
    addProfile(newProfile);
    navigate('/profile-select', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 mb-4 shadow-lg shadow-green-900/20">
            <span className="text-3xl">🥗</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">New Profile</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Tell us a bit about yourself
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm p-8 shadow-2xl shadow-black/40 flex flex-col gap-5">

          {/* ── Avatar picker ─────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-green-400 tracking-wide uppercase">
              Choose Avatar
            </span>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setAvatar(em)}
                  className={`w-11 h-11 text-2xl rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer
                    ${avatar === em
                      ? 'bg-green-500/20 ring-2 ring-green-500 scale-110'
                      : 'bg-gray-800 hover:bg-gray-700 hover:scale-105'}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <Field label="Full Name">
            <input
              id="field-name"
              type="text"
              placeholder="e.g. Alex Johnson"
              value={form.name}
              onChange={set('name')}
              className={`${inputCls} ${errors.name ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-400 mt-0.5">{errors.name}</p>}
          </Field>

          {/* Age */}
          <Field label="Age" hint="Years old">
            <input
              id="field-age"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              placeholder="e.g. 25"
              value={form.age}
              onChange={set('age')}
              className={`${inputCls} ${errors.age ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
            />
            {errors.age && <p className="text-xs text-red-400 mt-0.5">{errors.age}</p>}
          </Field>

          {/* Gender */}
          <Field label="Gender">
            <div className="relative">
              <select
                id="field-gender"
                value={form.gender}
                onChange={set('gender')}
                className={`${inputCls} appearance-none cursor-pointer pr-10 ${
                  errors.gender ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''
                } ${form.gender === '' ? 'text-gray-600' : 'text-white'}`}
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 6 8 10 12 6" />
                </svg>
              </span>
            </div>
            {errors.gender && <p className="text-xs text-red-400 mt-0.5">{errors.gender}</p>}
          </Field>

          {/* Weight + Height */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Weight" hint="Kilograms">
              <input
                id="field-weight"
                type="number"
                inputMode="decimal"
                min={1}
                max={500}
                placeholder="e.g. 70"
                value={form.weight}
                onChange={set('weight')}
                className={`${inputCls} ${errors.weight ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
              />
              {errors.weight && <p className="text-xs text-red-400 mt-0.5">{errors.weight}</p>}
            </Field>

            <Field label="Height" hint="Centimetres">
              <input
                id="field-height"
                type="number"
                inputMode="decimal"
                min={30}
                max={300}
                placeholder="e.g. 175"
                value={form.height}
                onChange={set('height')}
                className={`${inputCls} ${errors.height ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
              />
              {errors.height && <p className="text-xs text-red-400 mt-0.5">{errors.height}</p>}
            </Field>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate('/profile-select', { replace: true })}
              className="flex-1 py-3 rounded-xl border border-gray-700 bg-transparent text-gray-400 hover:border-gray-500 hover:text-white text-sm font-semibold transition-all duration-200 cursor-pointer"
            >
              ← Back
            </button>
            <button
              id="btn-save-profile"
              type="button"
              onClick={handleSave}
              className="flex-1 py-3.5 rounded-xl bg-green-500 hover:bg-green-400 active:scale-[0.98] text-gray-950 font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-green-900/40 cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
