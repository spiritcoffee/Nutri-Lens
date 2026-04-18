import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

/* ══════════════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════════════ */
const MASALAS = [
  'Turmeric', 'Cumin Seeds', 'Coriander Powder', 'Red Chilli Powder',
  'Garam Masala', 'Salt', 'Mustard Seeds', 'Black Pepper',
  'Cardamom', 'Cloves', 'Cinnamon', 'Hing',
  'Jeera Powder', 'Amchur', 'Kasuri Methi', 'Bay Leaves',
];

const EXTRAS = [
  'Oil', 'Ghee', 'Butter', 'Sugar',
  'Rice', 'Wheat Flour', 'Toor Dal', 'Moong Dal',
  'Curd', 'Milk', 'Paneer', 'Eggs', 'Bread', 'Noodles',
];

/* MobileNet class names → friendly ingredient labels */
const CLASS_MAP: Record<string, string> = {
  banana: 'Banana', apple: 'Apple', orange: 'Orange', lemon: 'Lemon',
  strawberry: 'Strawberry', pineapple: 'Pineapple', mango: 'Mango',
  broccoli: 'Broccoli', carrot: 'Carrot', cucumber: 'Cucumber',
  tomato: 'Tomato', onion: 'Onion', garlic: 'Garlic',
  potato: 'Potato', 'sweet potato': 'Sweet Potato', corn: 'Corn',
  mushroom: 'Mushroom', spinach: 'Spinach', cabbage: 'Cabbage',
  cauliflower: 'Cauliflower', pepper: 'Bell Pepper', eggplant: 'Eggplant',
  egg: 'Egg', chicken: 'Chicken', beef: 'Beef', pork: 'Pork',
  fish: 'Fish', shrimp: 'Shrimp', salmon: 'Salmon',
  bread: 'Bread', rice: 'Rice', noodle: 'Noodles', pasta: 'Pasta',
  milk: 'Milk', cheese: 'Cheese', butter: 'Butter', yogurt: 'Curd',
  lentil: 'Lentils', bean: 'Beans', pea: 'Peas',
  ginger: 'Ginger', coriander: 'Coriander', chili: 'Chilli',
};

function mapPredictions(predictions: { className: string; probability: number }[]): string[] {
  const results: string[] = [];
  for (const pred of predictions) {
    if (pred.probability < 0.1) continue;
    const lower = pred.className.toLowerCase();
    for (const [key, label] of Object.entries(CLASS_MAP)) {
      if (lower.includes(key) && !results.includes(label)) {
        results.push(label);
      }
    }
  }
  return results;
}

/* ══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════════════ */

/** Section heading */
const SectionTitle = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <div className="mb-4">
    <h2 className="text-lg font-bold text-white flex items-center gap-2">
      <span>{icon}</span> {title}
    </h2>
    {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
  </div>
);

/** Removable tag pill */
const Tag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/40 text-green-300 text-sm font-medium">
    {label}
    <button
      onClick={onRemove}
      className="hover:text-white transition-colors cursor-pointer leading-none"
      aria-label={`Remove ${label}`}
    >
      ×
    </button>
  </span>
);

/** Checkbox card — masala or extra */
const CheckCard = ({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer select-none
      ${checked
        ? 'border-green-500 bg-green-500/15 text-green-300'
        : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500 hover:text-gray-200'
      }`}
  >
    <span className="flex items-center gap-2">
      <span
        className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors duration-150
          ${checked ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-gray-950" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 12 12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
          </svg>
        )}
      </span>
      {label}
    </span>
  </button>
);

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════ */
const Scan = () => {
  const navigate = useNavigate();

  /* ── Section 1: Photo state ─────────────────────────────────────── */
  const [imageUrl, setImageUrl]           = useState<string | null>(null);
  const [detecting, setDetecting]         = useState(false);
  const [detectedTags, setDetectedTags]   = useState<string[]>([]);
  const [detectError, setDetectError]     = useState<string | null>(null);
  const imgRef                            = useRef<HTMLImageElement>(null);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  /* ── Section 2: Masalas ─────────────────────────────────────────── */
  const [masalas, setMasalas] = useState<Set<string>>(new Set());

  /* ── Section 3: Extras ──────────────────────────────────────────── */
  const [extras, setExtras] = useState<Set<string>>(new Set());

  /* ── Helpers ────────────────────────────────────────────────────── */
  const toggleSet = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) => {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  };

  /* ── Combined list (all 3 sections) ────────────────────────────── */
  const allIngredients = [
    ...detectedTags,
    ...Array.from(masalas),
    ...Array.from(extras),
  ];
  // Deduplicate
  const uniqueIngredients = [...new Set(allIngredients)];

  /* ── Photo upload & TF detection ────────────────────────────────── */
  const runDetection = useCallback(async (src: string) => {
    setDetecting(true);
    setDetectError(null);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      await new Promise<void>((res, rej) => {
        img.onload  = () => res();
        img.onerror = () => rej(new Error('Image failed to load'));
      });
      const model = await mobilenet.load();
      const predictions = await model.classify(img);
      const detected = mapPredictions(predictions);
      setDetectedTags((prev) => {
        const combined = new Set([...prev, ...detected]);
        return Array.from(combined);
      });
    } catch (err) {
      console.error(err);
      setDetectError('Detection failed — try another photo.');
    } finally {
      setDetecting(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setDetectedTags([]);
    runDetection(url);
  };

  const removeTag = (tag: string) =>
    setDetectedTags((prev) => prev.filter((t) => t !== tag));

  const handleNext = () => {
    sessionStorage.setItem('nutriLensIngredients', JSON.stringify(uniqueIngredients));
    navigate('/home');
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-950 text-white pb-32">
      {/* ─── Page header ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          🥘 Choose Ingredients
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Upload a photo or pick from the lists below
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-10">

        {/* ══════════════════════════════════════════════════════════
            SECTION 1 — PHOTO UPLOAD
        ══════════════════════════════════════════════════════════ */}
        <section>
          <SectionTitle
            icon="📷"
            title="Detect from Photo"
            subtitle="Upload a food photo — AI will detect ingredients automatically"
          />

          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center gap-3
              rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
              ${imageUrl
                ? 'border-green-700 bg-green-950/20 pt-3 pb-4 px-4'
                : 'border-gray-700 bg-gray-900/50 hover:border-green-600 hover:bg-green-950/10 py-10 px-4'}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Image preview */}
            {imageUrl ? (
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Uploaded food"
                className="w-full max-h-52 object-contain rounded-xl"
              />
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center text-3xl">
                  📁
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">Upload a photo</p>
                  <p className="text-gray-500 text-xs mt-1">JPG, PNG, WEBP · tap to browse</p>
                </div>
              </>
            )}

            {/* Change photo hint when image is loaded */}
            {imageUrl && (
              <p className="text-xs text-gray-600 mt-1">Tap to change photo</p>
            )}
          </div>

          {/* Loading spinner */}
          {detecting && (
            <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-950/30 border border-green-800/40">
              <svg className="animate-spin w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-green-300 text-sm font-medium">Detecting ingredients…</span>
            </div>
          )}

          {/* Error */}
          {detectError && (
            <p className="mt-3 text-red-400 text-xs px-1">{detectError}</p>
          )}

          {/* Detected tags */}
          {detectedTags.length > 0 && !detecting && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
                Detected ({detectedTags.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {detectedTags.map((tag) => (
                  <Tag key={tag} label={tag} onRemove={() => removeTag(tag)} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state after detection with no results */}
          {imageUrl && !detecting && detectedTags.length === 0 && !detectError && (
            <p className="mt-3 text-gray-600 text-xs px-1">
              No ingredients detected — try a clearer photo or add manually below.
            </p>
          )}
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 2 — MASALAS
        ══════════════════════════════════════════════════════════ */}
        <section>
          <SectionTitle
            icon="🌶️"
            title="Masalas & Spices"
            subtitle="Tap to mark what you have in your kitchen"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MASALAS.map((m) => (
              <CheckCard
                key={m}
                label={m}
                checked={masalas.has(m)}
                onToggle={() => toggleSet(masalas, setMasalas, m)}
              />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 3 — COMMON EXTRAS
        ══════════════════════════════════════════════════════════ */}
        <section>
          <SectionTitle
            icon="🥛"
            title="Common Pantry Items"
            subtitle="Staples and everyday ingredients"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EXTRAS.map((e) => (
              <CheckCard
                key={e}
                label={e}
                checked={extras.has(e)}
                onToggle={() => toggleSet(extras, setExtras, e)}
              />
            ))}
          </div>
        </section>

      </div>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM SUMMARY + NEXT BUTTON (sticky)
      ══════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 px-4 pt-3 pb-5">
        <div className="max-w-2xl mx-auto">

          {/* Tag summary */}
          {uniqueIngredients.length > 0 ? (
            <div className="mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
                Selected · {uniqueIngredients.length} item{uniqueIngredients.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                {uniqueIngredients.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-xs mb-3">
              No ingredients selected yet — upload a photo or tap items above.
            </p>
          )}

          {/* Next button */}
          <button
            id="btn-next-ingredients"
            onClick={handleNext}
            disabled={uniqueIngredients.length === 0}
            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer
              disabled:opacity-40 disabled:cursor-not-allowed
              bg-green-500 hover:bg-green-400 active:scale-[0.98] text-gray-950 shadow-lg shadow-green-900/40"
          >
            {uniqueIngredients.length === 0
              ? 'Select at least one ingredient'
              : `Next →  ${uniqueIngredients.length} ingredient${uniqueIngredients.length !== 1 ? 's' : ''} selected`
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scan;
