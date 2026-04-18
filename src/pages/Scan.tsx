import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

/* ══ DATA ══════════════════════════════════════════════════════════════ */
const MASALAS = [
  'Turmeric','Cumin Seeds','Coriander Powder','Red Chilli Powder',
  'Garam Masala','Salt','Mustard Seeds','Black Pepper',
  'Cardamom','Cloves','Cinnamon','Hing',
  'Jeera Powder','Amchur','Kasuri Methi','Bay Leaves',
];
const EXTRAS = [
  'Oil','Ghee','Butter','Sugar',
  'Rice','Wheat Flour','Toor Dal','Moong Dal',
  'Curd','Milk','Paneer','Eggs','Bread','Noodles',
];

const CLASS_MAP: Record<string, string> = {
  banana:'Banana', apple:'Apple', orange:'Orange', lemon:'Lemon',
  strawberry:'Strawberry', pineapple:'Pineapple', mango:'Mango',
  broccoli:'Broccoli', carrot:'Carrot', cucumber:'Cucumber',
  tomato:'Tomato', onion:'Onion', garlic:'Garlic',
  potato:'Potato', 'sweet potato':'Sweet Potato', corn:'Corn',
  mushroom:'Mushroom', spinach:'Spinach', cabbage:'Cabbage',
  cauliflower:'Cauliflower', pepper:'Bell Pepper', eggplant:'Eggplant',
  egg:'Egg', chicken:'Chicken', beef:'Beef', pork:'Pork',
  fish:'Fish', shrimp:'Shrimp', salmon:'Salmon',
  bread:'Bread', rice:'Rice', noodle:'Noodles', pasta:'Pasta',
  milk:'Milk', cheese:'Cheese', butter:'Butter', yogurt:'Curd',
  lentil:'Lentils', bean:'Beans', pea:'Peas',
  ginger:'Ginger', coriander:'Coriander', chili:'Chilli',
};

function mapPredictions(preds: { className: string; probability: number }[]): string[] {
  const out: string[] = [];
  for (const p of preds) {
    if (p.probability < 0.1) continue;
    const lower = p.className.toLowerCase();
    for (const [key, label] of Object.entries(CLASS_MAP)) {
      if (lower.includes(key) && !out.includes(label)) out.push(label);
    }
  }
  return out;
}

/* ══ SUB-COMPONENTS ════════════════════════════════════════════════════ */
const Tag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg
    bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
    {label}
    <button onClick={onRemove}
      className="hover:text-white transition-colors cursor-pointer text-sm leading-none"
      aria-label={`Remove ${label}`}>×</button>
  </span>
);

const CheckCard = ({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) => (
  <button type="button" onClick={onToggle}
    className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-medium
      transition-all duration-150 cursor-pointer select-none
      ${checked
        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
        : 'border-white/6 bg-white/2 text-gray-400 hover:border-white/12 hover:text-gray-200'}`}>
    <span className="flex items-center gap-2">
      <span className={`w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center border transition-colors
        ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`}>
        {checked && (
          <svg className="w-2 h-2 text-gray-950" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 12 12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5"/>
          </svg>
        )}
      </span>
      {label}
    </span>
  </button>
);

/* ══ MAIN ══════════════════════════════════════════════════════════════ */
const Scan = () => {
  const navigate = useNavigate();

  /* Photo state */
  const [imageUrl,     setImageUrl]     = useState<string | null>(null);
  const [detecting,    setDetecting]    = useState(false);
  const [detectedTags, setDetectedTags] = useState<string[]>([]);
  const [detectError,  setDetectError]  = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Checklist state */
  const [masalas, setMasalas] = useState<Set<string>>(new Set());
  const [extras,  setExtras]  = useState<Set<string>>(new Set());

  const toggleSet = (setFn: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) => {
    setFn(prev => {
      const n = new Set(prev);
      if (n.has(key)) { n.delete(key); } else { n.add(key); }
      return n;
    });
  };

  /* Combined deduplicated list */
  const allItems = [...new Set([...detectedTags, ...Array.from(masalas), ...Array.from(extras)])];

  /* TF detection */
  const runDetection = useCallback(async (src: string) => {
    setDetecting(true); setDetectError(null);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); });
      const model = await mobilenet.load();
      const preds = await model.classify(img);
      const detected = mapPredictions(preds);
      setDetectedTags(prev => [...new Set([...prev, ...detected])]);
    } catch { setDetectError('Detection failed — try another photo.'); }
    finally  { setDetecting(false); }
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url); setDetectedTags([]);
    runDetection(url);
  };

  const handleNext = () => {
    sessionStorage.setItem('nutriLensIngredients', JSON.stringify(allItems));
    navigate('/home');
  };

  return (
    <div className="page-enter">

      {/* ══ PAGE HEADER ═════════════════════════════════════════════ */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">🥘 Ingredients</h1>
          <p className="text-gray-500 text-sm mt-1">
            Detect from a photo · pick masalas · select pantry items
          </p>
        </div>

        {/* Next button — top right */}
        <button id="btn-next-ingredients" onClick={handleNext}
          disabled={allItems.length === 0}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl
            bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98]
            text-gray-950 font-bold text-sm transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer
            shadow-lg shadow-emerald-900/40">
          {allItems.length === 0
            ? 'Select ingredients first'
            : <>
                <span className="flex -space-x-1">
                  {allItems.slice(0,3).map(i => (
                    <span key={i} className="w-5 h-5 rounded-full bg-emerald-900 border border-emerald-500
                      flex items-center justify-center text-[10px] text-emerald-300 font-bold">
                      {i[0]}
                    </span>
                  ))}
                </span>
                Next → {allItems.length} item{allItems.length !== 1 ? 's' : ''}
              </>}
        </button>
      </div>

      {/* ══ TWO-COLUMN LAYOUT ═══════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-6 items-start">

        {/* ── LEFT COLUMN: Photo Upload ─────────────────────────── */}
        <div className="space-y-5">
          <div className="glass rounded-3xl p-6">
            <h2 className="text-white font-bold text-base mb-1 flex items-center gap-2">
              <span>📷</span> Detect from Photo
            </h2>
            <p className="text-gray-600 text-xs mb-5">
              Upload a food photo — AI identifies ingredients automatically
            </p>

            {/* Upload zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed cursor-pointer
                transition-all duration-200 overflow-hidden
                ${imageUrl
                  ? 'border-emerald-700/50'
                  : 'border-white/10 hover:border-emerald-600/50 hover:bg-emerald-950/10'}`}>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="upload" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity
                    flex items-center justify-center text-white text-sm font-semibold">
                    Click to change
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-14 px-6">
                  <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-3xl">📁</div>
                  <p className="text-white font-semibold text-sm">Drop a food photo here</p>
                  <p className="text-gray-600 text-xs">JPG, PNG, WEBP · click to browse</p>
                </div>
              )}
            </div>

            {/* Scan hero if no image */}
            {!imageUrl && (
              <div className="mt-4 relative rounded-2xl overflow-hidden h-28">
                <img src="/scan-hero.png" alt="scan" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#070a0e]/80 to-transparent flex items-center px-5">
                  <p className="text-emerald-300 text-xs font-semibold">
                    AI powered · 40+ ingredient types
                  </p>
                </div>
              </div>
            )}

            {/* Detecting */}
            {detecting && (
              <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl
                bg-emerald-950/40 border border-emerald-800/30">
                <svg className="animate-spin w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                <span className="text-emerald-300 text-sm">Detecting ingredients…</span>
              </div>
            )}
            {detectError && <p className="mt-3 text-red-400 text-xs">{detectError}</p>}

            {/* Detected tags */}
            {detectedTags.length > 0 && !detecting && (
              <div className="mt-5">
                <p className="text-xs text-gray-500 uppercase tracking-[0.12em] font-bold mb-2">
                  Detected · {detectedTags.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {detectedTags.map(t => (
                    <Tag key={t} label={t} onRemove={() => setDetectedTags(p => p.filter(x => x !== t))} />
                  ))}
                </div>
              </div>
            )}
            {imageUrl && !detecting && detectedTags.length === 0 && !detectError && (
              <p className="mt-4 text-gray-600 text-xs">No ingredients detected — try a clearer photo.</p>
            )}
          </div>

          {/* ── Summary panel ── */}
          <div className="glass rounded-3xl p-6">
            <h2 className="text-white font-bold text-base mb-1">All Selected</h2>
            <p className="text-gray-600 text-xs mb-4">{allItems.length} ingredient{allItems.length !== 1 ? 's' : ''} combined</p>
            {allItems.length === 0 ? (
              <p className="text-gray-700 text-sm text-center py-6">
                Nothing selected yet — upload a photo or check items on the right.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {allItems.map(item => (
                  <span key={item} className="px-2.5 py-1 rounded-lg glass border border-white/8
                    text-gray-300 text-xs font-medium">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Checklists ──────────────────────────── */}
        <div className="space-y-6">

          {/* Masalas */}
          <div className="glass rounded-3xl p-6">
            <h2 className="text-white font-bold text-base flex items-center gap-2 mb-1">
              <span>🌶️</span> Masalas & Spices
            </h2>
            <p className="text-gray-600 text-xs mb-5">Tap to mark what's in your kitchen</p>
            <div className="grid grid-cols-2 gap-2">
              {MASALAS.map(m => (
                <CheckCard key={m} label={m} checked={masalas.has(m)}
                  onToggle={() => toggleSet(setMasalas, m)} />
              ))}
            </div>
            {masalas.size > 0 && (
              <p className="mt-3 text-emerald-400 text-xs font-semibold">
                {masalas.size} spice{masalas.size !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Pantry */}
          <div className="glass rounded-3xl p-6">
            <h2 className="text-white font-bold text-base flex items-center gap-2 mb-1">
              <span>🥛</span> Pantry Staples
            </h2>
            <p className="text-gray-600 text-xs mb-5">Everyday ingredients you have at home</p>
            <div className="grid grid-cols-2 gap-2">
              {EXTRAS.map(e => (
                <CheckCard key={e} label={e} checked={extras.has(e)}
                  onToggle={() => toggleSet(setExtras, e)} />
              ))}
            </div>
            {extras.size > 0 && (
              <p className="mt-3 text-emerald-400 text-xs font-semibold">
                {extras.size} item{extras.size !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
