import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

/* ══ DATA ════════════════════════════════════════════════════════════════ */

const MASALAS: { name: string; emoji: string }[] = [
  { name: 'Turmeric',          emoji: '🟡' },
  { name: 'Cumin Seeds',       emoji: '🌿' },
  { name: 'Coriander Powder',  emoji: '🌱' },
  { name: 'Red Chilli Powder', emoji: '🌶️' },
  { name: 'Garam Masala',      emoji: '✨' },
  { name: 'Salt',              emoji: '🧂' },
  { name: 'Mustard Seeds',     emoji: '⚫' },
  { name: 'Black Pepper',      emoji: '🫚' },
  { name: 'Cardamom',          emoji: '💚' },
  { name: 'Hing',              emoji: '🟤' },
  { name: 'Kasuri Methi',      emoji: '🌾' },
  { name: 'Bay Leaves',        emoji: '🍃' },
];

const PANTRY: { name: string; emoji: string }[] = [
  { name: 'Oil',         emoji: '🫙' },
  { name: 'Ghee',        emoji: '🧈' },
  { name: 'Rice',        emoji: '🍚' },
  { name: 'Wheat Flour', emoji: '🌾' },
  { name: 'Toor Dal',    emoji: '🟡' },
  { name: 'Moong Dal',   emoji: '💛' },
  { name: 'Curd',        emoji: '🥣' },
  { name: 'Milk',        emoji: '🥛' },
  { name: 'Paneer',      emoji: '🧀' },
  { name: 'Eggs',        emoji: '🥚' },
  { name: 'Bread',       emoji: '🍞' },
];

const CLASS_MAP: Record<string, string> = {
  banana:'Banana', apple:'Apple', orange:'Orange', lemon:'Lemon',
  strawberry:'Strawberry', pineapple:'Pineapple', mango:'Mango',
  broccoli:'Broccoli', carrot:'Carrot', cucumber:'Cucumber',
  tomato:'Tomato', onion:'Onion', garlic:'Garlic',
  potato:'Potato', 'sweet potato':'Sweet Potato', corn:'Corn',
  mushroom:'Mushroom', spinach:'Spinach', cabbage:'Cabbage',
  cauliflower:'Cauliflower', pepper:'Bell Pepper', eggplant:'Eggplant',
  egg:'Eggs', chicken:'Chicken', beef:'Beef', pork:'Pork',
  fish:'Fish', shrimp:'Shrimp', salmon:'Salmon',
  bread:'Bread', rice:'Rice', noodle:'Noodles', pasta:'Pasta',
  milk:'Milk', cheese:'Cheese', butter:'Butter', yogurt:'Curd',
  lentil:'Lentils', bean:'Beans', pea:'Peas',
  ginger:'Ginger', coriander:'Coriander Powder', chili:'Red Chilli Powder',
  paneer:'Paneer',
};

function mapPredictions(preds: { className: string; probability: number }[]): string[] {
  const out: string[] = [];
  for (const p of preds) {
    if (p.probability < 0.08) continue;
    const lower = p.className.toLowerCase();
    for (const [key, label] of Object.entries(CLASS_MAP)) {
      if (lower.includes(key) && !out.includes(label)) out.push(label);
    }
  }
  return out;
}

/* ══ SUB-COMPONENTS ══════════════════════════════════════════════════════ */

const DetectedTag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
    bg-emerald-500/12 border border-emerald-500/35 text-emerald-300 text-xs font-medium
    hover:bg-emerald-500/20 transition-colors">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
    {label}
    <button onClick={onRemove} aria-label={`Remove ${label}`}
      className="ml-0.5 w-4 h-4 rounded-full bg-emerald-500/20 hover:bg-rose-500/30
        hover:text-rose-300 flex items-center justify-center
        text-emerald-400 text-sm leading-none transition-all cursor-pointer">
      ×
    </button>
  </span>
);

const CheckCard = ({
  name, emoji, checked, onToggle,
}: {
  name: string; emoji: string; checked: boolean; onToggle: () => void;
}) => (
  <button type="button" onClick={onToggle}
    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border text-sm
      font-medium transition-all duration-150 cursor-pointer select-none text-left w-full
      active:scale-[0.97]
      ${checked
        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-sm shadow-emerald-900/30'
        : 'border-white/7 bg-white/2 text-gray-400 hover:border-white/14 hover:bg-white/4 hover:text-gray-200'
      }`}>
    <span className="text-base w-6 text-center flex-shrink-0">{emoji}</span>
    <span className="flex-1 leading-tight text-xs font-semibold">{name}</span>
    {/* Checkbox visual */}
    <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all
      ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-700'}`}>
      {checked && (
        <svg className="w-2.5 h-2.5 text-gray-950" fill="none" stroke="currentColor"
          strokeWidth={3} viewBox="0 0 12 12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5"/>
        </svg>
      )}
    </span>
  </button>
);

/* Section header */
const SectionHeader = ({ icon, title, desc, count, onSelectAll, onClear }: {
  icon: string; title: string; desc: string; count: number; onSelectAll: () => void; onClear: () => void;
}) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <h2 className="text-white font-black text-base">{title}</h2>
        {count > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30
            text-emerald-400 text-[10px] font-black">
            {count}
          </span>
        )}
      </div>
      <p className="text-gray-600 text-xs">{desc}</p>
    </div>
    <div className="flex gap-1.5 flex-shrink-0">
      <button onClick={onSelectAll}
        className="px-2.5 py-1 rounded-lg glass border border-white/8 text-gray-500
          hover:text-emerald-400 hover:border-emerald-500/30 text-[10px] font-bold
          transition-all cursor-pointer">
        All
      </button>
      <button onClick={onClear}
        className="px-2.5 py-1 rounded-lg glass border border-white/8 text-gray-500
          hover:text-rose-400 hover:border-rose-500/30 text-[10px] font-bold
          transition-all cursor-pointer">
        Clear
      </button>
    </div>
  </div>
);

/* ══ MAIN PAGE ═══════════════════════════════════════════════════════════ */
const Scan = () => {
  const navigate = useNavigate();

  /* ── State ── */
  const [imageUrl,     setImageUrl]     = useState<string | null>(null);
  const [detecting,    setDetecting]    = useState(false);
  const [detectedTags, setDetectedTags] = useState<string[]>([]);
  const [detectError,  setDetectError]  = useState<string | null>(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [masalas, setMasalas] = useState<Set<string>>(new Set());
  const [pantry,  setPantry]  = useState<Set<string>>(new Set());

  /* ── Helpers ── */
  const toggleSet = (
    setFn: React.Dispatch<React.SetStateAction<Set<string>>>,
    key: string,
  ) => {
    setFn(prev => {
      const n = new Set(prev);
      if (n.has(key)) { n.delete(key); } else { n.add(key); }
      return n;
    });
  };

  const allItems = [...new Set([...detectedTags, ...Array.from(masalas), ...Array.from(pantry)])];

  /* ── TF.js MobileNet detection ── */
  const runDetection = useCallback(async (src: string) => {
    setDetecting(true); setDetectError(null);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error('Image load failed'));
      });
      const model = await mobilenet.load({ version: 2, alpha: 1 });
      const preds = await model.classify(img, 10);
      const detected = mapPredictions(preds);
      setDetectedTags(prev => [...new Set([...prev, ...detected])]);
      if (detected.length === 0) setDetectError('No ingredients detected — try a clearer food photo.');
    } catch {
      setDetectError('Detection failed — check your connection and try again.');
    } finally {
      setDetecting(false);
    }
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setDetectedTags([]);
    setDetectError(null);
    void runDetection(url);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleGenerate = () => {
    sessionStorage.setItem('nutriLensIngredients', JSON.stringify(allItems));
    navigate('/results');
  };

  /* ── Layout ── */
  return (
    /* Extra bottom padding for the sticky button bar */
    <div className="page-enter pb-32">

      {/* ══ PAGE HEADER ═══════════════════════════════════════════════ */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">🥘 Ingredients</h1>
        <p className="text-gray-500 text-sm mt-1">
          Detect from a photo · select masalas · pick pantry staples · then generate your meals
        </p>
      </div>

      {/* ══ SECTION 1 — PHOTO UPLOAD ══════════════════════════════════ */}
      <div className="glass rounded-3xl p-7 mb-6">
        <div className="grid grid-cols-2 gap-8 items-start">

          {/* Upload zone */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📷</span>
              <h2 className="text-white font-black text-base">Detect from Photo</h2>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30
                text-sky-400 text-[10px] font-black">AI</span>
            </div>
            <p className="text-gray-600 text-xs mb-5">
              Upload or drag a food photo — MobileNet CNN identifies ingredients automatically
            </p>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed cursor-pointer
                transition-all duration-200 overflow-hidden
                ${isDragging
                  ? 'border-emerald-400/60 bg-emerald-950/20 scale-[1.01]'
                  : imageUrl
                  ? 'border-emerald-700/40'
                  : 'border-white/10 hover:border-emerald-600/40 hover:bg-emerald-950/8'}`}>
              <input ref={fileInputRef} type="file" accept="image/*"
                className="hidden" onChange={handleFile} />

              {imageUrl ? (
                <div className="relative group">
                  <img src={imageUrl} alt="upload"
                    className="w-full h-56 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                    transition-opacity flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">📸</span>
                    <p className="text-white text-sm font-bold">Click to change photo</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-12 px-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
                    text-3xl transition-all duration-200
                    ${isDragging ? 'bg-emerald-500/20 scale-110' : 'glass'}`}>
                    {isDragging ? '✅' : '📁'}
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">
                      {isDragging ? 'Drop it!' : 'Drop a food photo here'}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      JPG · PNG · WEBP · click to browse
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Detecting spinner */}
            {detecting && (
              <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl
                bg-emerald-950/40 border border-emerald-800/30">
                <svg className="animate-spin w-4 h-4 text-emerald-400 flex-shrink-0"
                  fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-80" fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                <div>
                  <p className="text-emerald-300 text-sm font-semibold">Running MobileNet CNN…</p>
                  <p className="text-emerald-700 text-xs">Loading model and classifying image</p>
                </div>
              </div>
            )}

            {detectError && !detecting && (
              <p className="mt-3 text-amber-400 text-xs bg-amber-950/30 border border-amber-800/30
                rounded-xl px-4 py-2">
                ⚠️ {detectError}
              </p>
            )}
          </div>

          {/* Detected results */}
          <div className="flex flex-col h-full">
            <h3 className="text-white font-bold text-sm mb-1">Detected Ingredients</h3>
            <p className="text-gray-600 text-xs mb-4">
              Results appear here after upload. You can remove incorrect detections.
            </p>

            {!imageUrl && !detecting && (
              <div className="flex-1 flex flex-col items-center justify-center text-center
                py-10 border-2 border-dashed border-white/6 rounded-2xl">
                <span className="text-4xl mb-3 opacity-40">🔍</span>
                <p className="text-gray-700 text-sm">Upload a food photo to get started</p>
              </div>
            )}

            {detecting && (
              <div className="flex-1 flex flex-col gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="shimmer h-8 rounded-xl" />
                ))}
              </div>
            )}

            {!detecting && detectedTags.length > 0 && (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-emerald-400 text-xs font-bold">
                    ✅ {detectedTags.length} ingredient{detectedTags.length !== 1 ? 's' : ''} detected
                  </span>
                  <button
                    onClick={() => setDetectedTags([])}
                    className="text-[10px] text-gray-600 hover:text-rose-400 transition-colors cursor-pointer">
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto">
                  {detectedTags.map(t => (
                    <DetectedTag key={t} label={t}
                      onRemove={() => setDetectedTags(p => p.filter(x => x !== t))} />
                  ))}
                </div>
                <p className="text-gray-700 text-[10px] mt-3">
                  Click × to remove incorrect detections before generating meals
                </p>
              </div>
            )}

            {imageUrl && !detecting && detectedTags.length === 0 && !detectError && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <span className="text-3xl mb-2">📷</span>
                <p className="text-gray-600 text-sm">No matching ingredients found</p>
                <p className="text-gray-700 text-xs mt-1">
                  Try a clearer photo with visible food items
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ SECTION 2 — MASALAS ═══════════════════════════════════════ */}
      <div className="glass rounded-3xl p-7 mb-6">
        <SectionHeader
          icon="🌶️"
          title="Masalas & Spices"
          desc="Select the spices in your kitchen — these will be used to suggest authentic Indian meals"
          count={masalas.size}
          onSelectAll={() => setMasalas(new Set(MASALAS.map(m => m.name)))}
          onClear={() => setMasalas(new Set())}
        />
        <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-4">
          {MASALAS.map(({ name, emoji }) => (
            <CheckCard key={name} name={name} emoji={emoji}
              checked={masalas.has(name)}
              onToggle={() => toggleSet(setMasalas, name)} />
          ))}
        </div>
        {masalas.size > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
            {Array.from(masalas).map(m => (
              <span key={m} className="px-2.5 py-1 rounded-lg bg-emerald-500/10
                border border-emerald-500/25 text-emerald-400 text-xs font-medium">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ══ SECTION 3 — PANTRY STAPLES ════════════════════════════════ */}
      <div className="glass rounded-3xl p-7 mb-6">
        <SectionHeader
          icon="🥛"
          title="Pantry Staples"
          desc="Common everyday ingredients you have at home — select everything that's available"
          count={pantry.size}
          onSelectAll={() => setPantry(new Set(PANTRY.map(p => p.name)))}
          onClear={() => setPantry(new Set())}
        />
        <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-4">
          {PANTRY.map(({ name, emoji }) => (
            <CheckCard key={name} name={name} emoji={emoji}
              checked={pantry.has(name)}
              onToggle={() => toggleSet(setPantry, name)} />
          ))}
        </div>
        {pantry.size > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
            {Array.from(pantry).map(p => (
              <span key={p} className="px-2.5 py-1 rounded-lg bg-sky-500/10
                border border-sky-500/25 text-sky-400 text-xs font-medium">
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ══ STICKY BOTTOM BAR — ALL SELECTED + GENERATE ═══════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50
        bg-[#070a0e]/90 backdrop-blur-xl border-t border-white/8
        px-8 py-4 flex items-center gap-6">

        {/* Selected summary */}
        <div className="flex-1 min-w-0">
          {allItems.length === 0 ? (
            <div>
              <p className="text-gray-600 text-sm font-semibold">No ingredients selected yet</p>
              <p className="text-gray-700 text-xs mt-0.5">
                Upload a photo or check items in the sections above
              </p>
            </div>
          ) : (
            <div>
              <p className="text-white text-sm font-bold mb-2">
                {allItems.length} ingredient{allItems.length !== 1 ? 's' : ''} selected
                <span className="text-gray-600 font-normal ml-2">
                  — {detectedTags.length} detected, {masalas.size} spices, {pantry.size} pantry
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-10 overflow-hidden">
                {allItems.map(item => (
                  <span key={item} className="px-2 py-0.5 rounded-md glass
                    border border-white/8 text-gray-400 text-xs font-medium whitespace-nowrap">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generate button */}
        <button
          id="btn-generate-meals"
          onClick={handleGenerate}
          disabled={allItems.length === 0}
          className="flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-2xl
            bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98]
            disabled:opacity-30 disabled:cursor-not-allowed
            text-gray-950 font-black text-base transition-all duration-200
            cursor-pointer shadow-xl shadow-emerald-900/50
            glow-green">
          <span className="text-xl">✨</span>
          Generate Meals
          {allItems.length > 0 && (
            <span className="flex items-center justify-center w-6 h-6 rounded-full
              bg-gray-950/20 text-sm font-black">
              {allItems.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Scan;
