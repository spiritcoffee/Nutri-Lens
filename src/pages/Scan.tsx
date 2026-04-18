import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import {
  autocompleteIngredients,
  ingredientImageUrl,
  isSpoonacularConfigured,
  type SpoonacularIngredient,
} from '../data/spoonacularApi';

/* ══ DATA ════════════════════════════════════════════════════════════════ */

interface IngredientItem { name: string; emoji: string }

const VEGETABLES: IngredientItem[] = [
  { name: 'Tomato',        emoji: '🍅' },
  { name: 'Onion',         emoji: '🧅' },
  { name: 'Potato',        emoji: '🥔' },
  { name: 'Garlic',        emoji: '🧄' },
  { name: 'Ginger',        emoji: '🫚' },
  { name: 'Carrot',        emoji: '🥕' },
  { name: 'Spinach',       emoji: '🥬' },
  { name: 'Broccoli',      emoji: '🥦' },
  { name: 'Cauliflower',   emoji: '🤍' },
  { name: 'Cabbage',       emoji: '🥗' },
  { name: 'Bell Pepper',   emoji: '🫑' },
  { name: 'Eggplant',      emoji: '🍆' },
  { name: 'Cucumber',      emoji: '🥒' },
  { name: 'Corn',          emoji: '🌽' },
  { name: 'Mushroom',      emoji: '🍄' },
  { name: 'Sweet Potato',  emoji: '🍠' },
  { name: 'Green Beans',   emoji: '🫛' },
  { name: 'Zucchini',      emoji: '🥒' },
  { name: 'Pumpkin',       emoji: '🎃' },
  { name: 'Beetroot',      emoji: '🟣' },
  { name: 'Radish',        emoji: '🔴' },
  { name: 'Lettuce',       emoji: '🥬' },
  { name: 'Okra',          emoji: '💚' },
  { name: 'Bottle Gourd',  emoji: '🟢' },
  { name: 'Bitter Gourd',  emoji: '🥒' },
  { name: 'Green Peas',    emoji: '🟢' },
  { name: 'Spring Onion',  emoji: '🧅' },
  { name: 'Mint Leaves',   emoji: '🌿' },
  { name: 'Curry Leaves',  emoji: '🍃' },
  { name: 'Coriander Leaves', emoji: '🌱' },
];

const FRUITS: IngredientItem[] = [
  { name: 'Banana',     emoji: '🍌' },
  { name: 'Apple',      emoji: '🍎' },
  { name: 'Orange',     emoji: '🍊' },
  { name: 'Mango',      emoji: '🥭' },
  { name: 'Lemon',      emoji: '🍋' },
  { name: 'Strawberry', emoji: '🍓' },
  { name: 'Pineapple',  emoji: '🍍' },
  { name: 'Grapes',     emoji: '🍇' },
  { name: 'Watermelon', emoji: '🍉' },
  { name: 'Papaya',     emoji: '🟠' },
  { name: 'Guava',      emoji: '🟢' },
  { name: 'Pomegranate',emoji: '❤️' },
  { name: 'Coconut',    emoji: '🥥' },
  { name: 'Lime',       emoji: '🟩' },
  { name: 'Avocado',    emoji: '🥑' },
  { name: 'Kiwi',       emoji: '🥝' },
  { name: 'Peach',      emoji: '🍑' },
  { name: 'Cherry',     emoji: '🍒' },
];

const PROTEINS: IngredientItem[] = [
  { name: 'Chicken',    emoji: '🍗' },
  { name: 'Eggs',       emoji: '🥚' },
  { name: 'Fish',       emoji: '🐟' },
  { name: 'Shrimp',     emoji: '🦐' },
  { name: 'Salmon',     emoji: '🐠' },
  { name: 'Mutton',     emoji: '🥩' },
  { name: 'Paneer',     emoji: '🧀' },
  { name: 'Tofu',       emoji: '⬜' },
  { name: 'Soya Chunks',emoji: '🟤' },
  { name: 'Prawns',     emoji: '🦐' },
  { name: 'Tuna',       emoji: '🐟' },
  { name: 'Turkey',     emoji: '🦃' },
];

const GRAINS: IngredientItem[] = [
  { name: 'Rice',        emoji: '🍚' },
  { name: 'Wheat Flour', emoji: '🌾' },
  { name: 'Bread',       emoji: '🍞' },
  { name: 'Pasta',       emoji: '🍝' },
  { name: 'Noodles',     emoji: '🍜' },
  { name: 'Oats',        emoji: '🥣' },
  { name: 'Quinoa',      emoji: '🟡' },
  { name: 'Semolina',    emoji: '🟡' },
  { name: 'Corn Flour',  emoji: '🌽' },
  { name: 'Poha',        emoji: '🍚' },
  { name: 'Besan',       emoji: '🟡' },
  { name: 'Maida',       emoji: '⚪' },
  { name: 'Bajra',       emoji: '🟤' },
  { name: 'Jowar',       emoji: '🟠' },
  { name: 'Ragi',        emoji: '🟫' },
];

const DAIRY_FATS: IngredientItem[] = [
  { name: 'Milk',       emoji: '🥛' },
  { name: 'Curd',       emoji: '🥣' },
  { name: 'Ghee',       emoji: '🧈' },
  { name: 'Butter',     emoji: '🧈' },
  { name: 'Cheese',     emoji: '🧀' },
  { name: 'Oil',        emoji: '🫙' },
  { name: 'Cream',      emoji: '🍦' },
  { name: 'Coconut Oil',emoji: '🥥' },
  { name: 'Olive Oil',  emoji: '🫒' },
  { name: 'Coconut Milk',emoji: '🥥' },
];

const LEGUMES: IngredientItem[] = [
  { name: 'Toor Dal',    emoji: '🟡' },
  { name: 'Moong Dal',   emoji: '💛' },
  { name: 'Chana Dal',   emoji: '🟠' },
  { name: 'Masoor Dal',  emoji: '🔴' },
  { name: 'Urad Dal',    emoji: '⚫' },
  { name: 'Rajma',       emoji: '🫘' },
  { name: 'Chole',       emoji: '🟤' },
  { name: 'Lentils',     emoji: '🟡' },
  { name: 'Peas',        emoji: '🟢' },
  { name: 'Black Beans', emoji: '⚫' },
  { name: 'Peanuts',     emoji: '🥜' },
  { name: 'Cashews',     emoji: '🟡' },
  { name: 'Almonds',     emoji: '🟤' },
];

const MASALAS: IngredientItem[] = [
  { name: 'Turmeric',          emoji: '🟡' },
  { name: 'Cumin Seeds',       emoji: '🌿' },
  { name: 'Coriander Powder',  emoji: '🌱' },
  { name: 'Red Chilli Powder', emoji: '🌶️' },
  { name: 'Garam Masala',      emoji: '✨' },
  { name: 'Salt',              emoji: '🧂' },
  { name: 'Mustard Seeds',     emoji: '⚫' },
  { name: 'Black Pepper',      emoji: '⚫' },
  { name: 'Cardamom',          emoji: '💚' },
  { name: 'Hing',              emoji: '🟤' },
  { name: 'Kasuri Methi',      emoji: '🌾' },
  { name: 'Bay Leaves',        emoji: '🍃' },
  { name: 'Cinnamon',          emoji: '🟤' },
  { name: 'Cloves',            emoji: '🟤' },
  { name: 'Fennel Seeds',      emoji: '🌿' },
  { name: 'Fenugreek Seeds',   emoji: '🟡' },
  { name: 'Chaat Masala',      emoji: '✨' },
  { name: 'Amchur',            emoji: '🟤' },
  { name: 'Saffron',           emoji: '🟠' },
  { name: 'Nutmeg',            emoji: '🟤' },
  { name: 'Ajwain',            emoji: '🌿' },
  { name: 'Oregano',           emoji: '🌿' },
  { name: 'Paprika',           emoji: '🔴' },
  { name: 'Sugar',             emoji: '🍬' },
  { name: 'Tamarind',          emoji: '🟤' },
  { name: 'Vinegar',           emoji: '🫙' },
  { name: 'Soy Sauce',        emoji: '🟫' },
  { name: 'Tomato Paste',      emoji: '🍅' },
  { name: 'Jaggery',           emoji: '🟤' },
  { name: 'Sesame Seeds',      emoji: '⚪' },
];

/* ── All categories for unified operations ── */
interface CategoryDef {
  key: string;
  icon: string;
  title: string;
  desc: string;
  items: IngredientItem[];
  accent: string;    // border/badge color
  chipBg: string;    // chip background
  chipBorder: string;
  chipText: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'vegetables', icon: '🥦', title: 'Vegetables',
    desc: 'Fresh vegetables — select what you have on hand',
    items: VEGETABLES,
    accent: 'emerald', chipBg: 'bg-emerald-500/10', chipBorder: 'border-emerald-500/25', chipText: 'text-emerald-400',
  },
  {
    key: 'fruits', icon: '🍎', title: 'Fruits',
    desc: 'Fresh and dried fruits available in your kitchen',
    items: FRUITS,
    accent: 'amber', chipBg: 'bg-amber-500/10', chipBorder: 'border-amber-500/25', chipText: 'text-amber-400',
  },
  {
    key: 'proteins', icon: '🍗', title: 'Proteins',
    desc: 'Meat, seafood, and plant-based protein sources',
    items: PROTEINS,
    accent: 'rose', chipBg: 'bg-rose-500/10', chipBorder: 'border-rose-500/25', chipText: 'text-rose-400',
  },
  {
    key: 'grains', icon: '🌾', title: 'Grains & Carbs',
    desc: 'Rice, flours, breads, and other carbohydrate sources',
    items: GRAINS,
    accent: 'purple', chipBg: 'bg-purple-500/10', chipBorder: 'border-purple-500/25', chipText: 'text-purple-400',
  },
  {
    key: 'dairy', icon: '🥛', title: 'Dairy & Fats',
    desc: 'Milk products, oils, and cooking fats',
    items: DAIRY_FATS,
    accent: 'sky', chipBg: 'bg-sky-500/10', chipBorder: 'border-sky-500/25', chipText: 'text-sky-400',
  },
  {
    key: 'legumes', icon: '🫘', title: 'Legumes & Nuts',
    desc: 'Dals, beans, lentils, and dry fruits',
    items: LEGUMES,
    accent: 'orange', chipBg: 'bg-orange-500/10', chipBorder: 'border-orange-500/25', chipText: 'text-orange-400',
  },
  {
    key: 'masalas', icon: '🌶️', title: 'Masalas & Spices',
    desc: 'Spices, seasonings, and condiments for authentic Indian cooking',
    items: MASALAS,
    accent: 'yellow', chipBg: 'bg-yellow-500/10', chipBorder: 'border-yellow-500/25', chipText: 'text-yellow-400',
  },
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
  name, emoji, checked, onToggle, highlight, isSearching
}: {
  name: string; emoji: string; checked: boolean; onToggle: () => void; highlight?: boolean; isSearching?: boolean;
}) => (
  <button type="button" onClick={onToggle}
    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border text-sm
      font-medium transition-all duration-150 cursor-pointer select-none text-left w-full
      active:scale-[0.97]
      ${checked
        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-sm shadow-emerald-900/30'
        : highlight
        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300 ring-1 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]'
        : 'glass glass-hover text-gray-400 hover:text-gray-200'
      }
      ${isSearching && !highlight && !checked ? 'opacity-25 saturate-50 pointer-events-none' : ''}`}>
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
const SectionHeader = ({ icon, title, desc, count, onSelectAll, onClear, accent }: {
  icon: string; title: string; desc: string; count: number; onSelectAll: () => void; onClear: () => void; accent: string;
}) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <h2 className="text-white font-black text-base">{title}</h2>
        {count > 0 && (
          <span className={`px-2 py-0.5 rounded-full bg-${accent}-500/15 border border-${accent}-500/30
            text-${accent}-400 text-[10px] font-black`}>
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

  /* Per-category selection as a single map */
  const [selected, setSelected] = useState<Record<string, Set<string>>>(() => {
    const m: Record<string, Set<string>> = {};
    for (const cat of CATEGORIES) m[cat.key] = new Set();
    return m;
  });

  /* Search state */
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  /* Spoonacular API state */
  const [apiResults, setApiResults] = useState<SpoonacularIngredient[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiIngredients, setApiIngredients] = useState<Set<string>>(new Set());
  const hasApi = isSpoonacularConfigured();
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  /* ── Debounced Spoonacular autocomplete ── */
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!hasApi || !searchQuery.trim() || searchQuery.trim().length < 2) {
      setApiResults([]);
      setApiLoading(false);
      return;
    }
    setApiLoading(true);
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      const results = await autocompleteIngredients(searchQuery.trim(), 8);
      setApiResults(results);
      setApiLoading(false);
    }, 300);
    return () => clearTimeout(debounceTimerRef.current);
  }, [searchQuery, hasApi]);

  const addApiIngredient = (name: string) => {
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    setApiIngredients(prev => new Set(prev).add(capitalized));
    setSearchQuery('');
    setApiResults([]);
  };

  const removeApiIngredient = (name: string) => {
    setApiIngredients(prev => {
      const n = new Set(prev);
      n.delete(name);
      return n;
    });
  };

  /* ── Helpers ── */
  const toggleItem = (catKey: string, itemName: string) => {
    setSelected(prev => {
      const n = { ...prev };
      const s = new Set(n[catKey]);
      if (s.has(itemName)) s.delete(itemName); else s.add(itemName);
      n[catKey] = s;
      return n;
    });
  };

  const selectAllInCategory = (catKey: string, items: IngredientItem[]) => {
    setSelected(prev => ({
      ...prev,
      [catKey]: new Set(items.map(i => i.name)),
    }));
  };

  const clearCategory = (catKey: string) => {
    setSelected(prev => ({
      ...prev,
      [catKey]: new Set(),
    }));
  };

  /* Total count */
  const totalSelected = useMemo(() => {
    let count = 0;
    for (const s of Object.values(selected)) count += s.size;
    return count;
  }, [selected]);

  /* All items from detected + selected + API */
  const allItems = useMemo(() => {
    const set = new Set<string>([...detectedTags]);
    for (const s of Object.values(selected)) {
      for (const item of s) set.add(item);
    }
    for (const item of apiIngredients) set.add(item);
    return [...set];
  }, [detectedTags, selected, apiIngredients]);

  /* Search filter — which items match */
  const searchLower = searchQuery.toLowerCase().trim();
  const matchesSearch = useCallback((name: string) => {
    if (!searchLower) return false;
    return name.toLowerCase().includes(searchLower);
  }, [searchLower]);

  /* Local search results */
  const localItemsMatch = useMemo(() => {
    if (!searchLower) return [];
    const results: { name: string, emoji: string, catKey: string }[] = [];
    for (const cat of CATEGORIES) {
      for (const item of cat.items) {
        if (item.name.toLowerCase().includes(searchLower)) {
          results.push({ ...item, catKey: cat.key });
        }
      }
    }
    return results;
  }, [searchLower]);

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
          Detect from a photo · select your ingredients · then generate personalised meals
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

      {/* ══ SEARCH BAR ════════════════════════════════════════════════ */}
      <div className="mb-6 relative z-50" ref={searchDropdownRef}>
        <div className={`relative glass rounded-2xl transition-all duration-300 ${
          searchFocused ? 'ring-2 ring-emerald-500/40 border-emerald-500/30' : ''
        }`}>
          <div className="flex items-center gap-3 px-5 py-4">
            {/* Search icon */}
            <svg className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
              searchFocused ? 'text-emerald-400' : 'text-gray-600'
            }`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>

            {/* Input */}
            <input
              id="ingredient-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder={hasApi
                ? 'Search 86,000+ ingredients via Spoonacular...'
                : 'Search ingredients... (e.g. tomato, chicken, turmeric)'}
              className="flex-1 bg-transparent text-white text-sm font-medium
                placeholder:text-gray-600 outline-none"
            />

            {/* API loading spinner */}
            {apiLoading && (
              <svg className="animate-spin w-4 h-4 text-emerald-400 flex-shrink-0"
                fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-80" fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            )}

            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setApiResults([]); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  bg-white/5 hover:bg-white/10 border border-white/8
                  text-gray-400 hover:text-white text-xs font-semibold
                  transition-all cursor-pointer">
                <span>×</span> Clear
              </button>
            )}

            {/* Result count badge */}
            {searchLower && (
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                localItemsMatch.length > 0 || apiResults.length > 0
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              }`}>
                {localItemsMatch.length + apiResults.length} found
              </span>
            )}

            {/* Powered by Spoonacular badge */}
            {hasApi && (
              <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg
                bg-emerald-950/50 border border-emerald-800/25 text-[9px] text-emerald-500/70
                font-semibold flex-shrink-0">
                ⚡ Spoonacular
              </span>
            )}
          </div>

          {/* Search tips bar */}
          {searchFocused && !searchQuery && (
            <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-gray-700 font-semibold uppercase tracking-wider mr-1">Try:</span>
              {['avocado', 'chicken breast', 'saffron', 'quinoa', 'mozzarella'].map(term => (
                <button key={term}
                  onMouseDown={e => { e.preventDefault(); setSearchQuery(term); }}
                  className="px-2.5 py-1 rounded-lg bg-white/4 border border-white/6
                    text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30
                    text-[10px] font-semibold transition-all cursor-pointer">
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        {searchFocused && searchQuery.trim().length >= 2 && (apiResults.length > 0 || apiLoading || localItemsMatch.length > 0) && (
          <div className="absolute left-0 right-0 top-full mt-3 z-[100]
            bg-[#070a0e] rounded-2xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]
            overflow-hidden animate-[fadeIn_0.15s_ease]">

            {/* Local Results */}
            {localItemsMatch.length > 0 && (
              <div className="border-b border-white/6 pb-1">
                <div className="px-4 py-2 mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Quick Add (Local)
                  </span>
                  <span className="text-[10px] text-emerald-500/70 font-semibold">
                    {localItemsMatch.length} found
                  </span>
                </div>
                {localItemsMatch.map(item => {
                  const alreadySelected = selected[item.catKey]?.has(item.name);
                  return (
                    <button
                      key={item.name}
                      onMouseDown={e => {
                        e.preventDefault();
                        toggleItem(item.catKey, item.name);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left
                        transition-all duration-100 hover:bg-emerald-500/8 cursor-pointer">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8
                        flex items-center justify-center text-base flex-shrink-0">
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold capitalize truncate ${
                          alreadySelected ? 'text-emerald-400' : 'text-white'
                        }`}>
                          {item.name}
                        </p>
                      </div>
                      {alreadySelected && (
                        <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5
                          rounded bg-emerald-500/10">Added</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* API Header */}
            {(apiResults.length > 0 || apiLoading) && (
              <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Spoonacular Results
                </span>
                {apiResults.length > 0 && (
                  <span className="text-[10px] text-emerald-500/70 font-semibold">
                    {apiResults.length} suggestions
                  </span>
                )}
              </div>
            )}

            {/* Loading state */}
            {apiLoading && apiResults.length === 0 && (
              <div className="px-4 py-6 flex items-center justify-center gap-3">
                <svg className="animate-spin w-4 h-4 text-emerald-400"
                  fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-80" fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                <span className="text-gray-500 text-xs">Searching Spoonacular...</span>
              </div>
            )}

            {/* Results list */}
            {apiResults.map(item => {
              const capitalized = item.name.charAt(0).toUpperCase() + item.name.slice(1);
              const alreadyAdded = apiIngredients.has(capitalized) || allItems.includes(capitalized);
              return (
                <button
                  key={item.id}
                  onMouseDown={e => {
                    e.preventDefault();
                    if (!alreadyAdded) addApiIngredient(item.name);
                  }}
                  disabled={alreadyAdded}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left
                    transition-all duration-100
                    ${alreadyAdded
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-emerald-500/8 cursor-pointer'}`}>
                  {/* Ingredient image */}
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8
                    overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={ingredientImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-lg">🥘</span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold capitalize truncate">
                      {item.name}
                    </p>
                  </div>

                  {/* Add / Added badge */}
                  {alreadyAdded ? (
                    <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5
                      rounded bg-emerald-500/10">Added</span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5
                      rounded bg-emerald-500/10 group-hover:bg-emerald-500/20">+ Add</span>
                  )}
                </button>
              );
            })}

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] text-gray-700">Click to add to your ingredients</span>
              <span className="text-[9px] text-emerald-700 font-semibold">Powered by Spoonacular API</span>
            </div>
          </div>
        )}

        {/* Active search info */}
        {searchLower && localItemsMatch.length > 0 && !searchFocused && (
          <p className="text-emerald-500/70 text-xs mt-2 ml-1">
            ✨ Matching items highlighted below — click to add them to your selection
          </p>
        )}
      </div>

      {/* ══ API INGREDIENTS (from Spoonacular search) ══════════════════ */}
      {apiIngredients.size > 0 && (
        <div className="glass rounded-3xl p-7 mb-6 border border-emerald-500/15">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🔌</span>
                <h2 className="text-white font-black text-base">Custom Ingredients</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30
                  text-emerald-400 text-[10px] font-black">
                  {apiIngredients.size}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/25
                  text-sky-400 text-[9px] font-bold">
                  via Spoonacular
                </span>
              </div>
              <p className="text-gray-600 text-xs">
                Ingredients added from Spoonacular API search — sourced from 86,000+ items
              </p>
            </div>
            <button onClick={() => setApiIngredients(new Set())}
              className="px-2.5 py-1 rounded-lg glass border border-white/8 text-gray-500
                hover:text-rose-400 hover:border-rose-500/30 text-[10px] font-bold
                transition-all cursor-pointer">
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(apiIngredients).map(name => (
              <span key={name} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                bg-emerald-500/12 border border-emerald-500/35 text-emerald-300 text-xs font-medium
                hover:bg-emerald-500/20 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                {name}
                <button onClick={() => removeApiIngredient(name)} aria-label={`Remove ${name}`}
                  className="ml-0.5 w-4 h-4 rounded-full bg-emerald-500/20 hover:bg-rose-500/30
                    hover:text-rose-300 flex items-center justify-center
                    text-emerald-400 text-sm leading-none transition-all cursor-pointer">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ══ INGREDIENT CATEGORY SECTIONS ═══════════════════════════════ */}
      {CATEGORIES.map(cat => {
        const catSelected = selected[cat.key];
        const count = catSelected.size;

        return (
          <div key={cat.key} className="glass rounded-3xl p-7 mb-6 transition-all duration-300">
            <SectionHeader
              icon={cat.icon}
              title={cat.title}
              desc={cat.desc}
              count={count}
              accent={cat.accent}
              onSelectAll={() => selectAllInCategory(cat.key, cat.items)}
              onClear={() => clearCategory(cat.key)}
            />
            <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-4">
              {cat.items.map(({ name, emoji }) => (
                <CheckCard key={name} name={name} emoji={emoji}
                  checked={catSelected.has(name)}
                  highlight={searchLower ? matchesSearch(name) : false}
                  isSearching={!!searchLower}
                  onToggle={() => toggleItem(cat.key, name)} />
              ))}
            </div>
            {count > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                {Array.from(catSelected).map(m => (
                  <span key={m} className={`px-2.5 py-1 rounded-lg ${cat.chipBg}
                    border ${cat.chipBorder} ${cat.chipText} text-xs font-medium`}>
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}

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
                  — {detectedTags.length} detected, {totalSelected} preset{apiIngredients.size > 0 ? `, ${apiIngredients.size} via API` : ''}
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
