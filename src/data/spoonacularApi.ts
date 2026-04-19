/* ── Spoonacular API Service ────────────────────────────────────────────
   Provides ingredient autocomplete search and nutrition data
   from the Spoonacular Food API (free tier: 150 requests/day).
   https://spoonacular.com/food-api/docs
   ──────────────────────────────────────────────────────────────────── */

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY as string | undefined;
const BASE = 'https://api.spoonacular.com';

/* ── Types ── */
export interface SpoonacularIngredient {
  id: number;
  name: string;
  image: string;   // filename like "apple.jpg"
  aisle?: string;   // e.g. "Produce", "Spices and Seasonings"
}

export interface SpoonacularNutrition {
  calories: number;
  protein: number;   // g
  carbs: number;     // g
  fat: number;       // g
}

/* ── Helpers ── */

/** Build the full CDN URL for an ingredient image */
export function ingredientImageUrl(filename: string, size: '100x100' | '250x250' = '100x100'): string {
  return `https://img.spoonacular.com/ingredients_${size}/${filename}`;
}

/** Check if the Spoonacular API key is configured */
export function isSpoonacularConfigured(): boolean {
  return !!API_KEY && API_KEY !== 'YOUR_SPOONACULAR_API_KEY_HERE';
}

/* ── Autocomplete Ingredient Search ── */

/**
 * Search for ingredients by name using Spoonacular's autocomplete endpoint.
 * Returns up to `number` results (default 8).
 *
 * Endpoint: GET /food/ingredients/autocomplete
 * Docs: https://spoonacular.com/food-api/docs#Autocomplete-Ingredient-Search
 */
export async function autocompleteIngredients(
  query: string,
  number = 8,
): Promise<SpoonacularIngredient[]> {
  if (!isSpoonacularConfigured() || !query.trim()) return [];

  try {
    const url = new URL(`${BASE}/food/ingredients/autocomplete`);
    url.searchParams.set('apiKey', API_KEY!);
    url.searchParams.set('query', query.trim());
    url.searchParams.set('number', String(number));
    url.searchParams.set('metaInformation', 'true');

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.warn(`Spoonacular autocomplete failed: ${res.status}`);
      return [];
    }

    const data = (await res.json()) as SpoonacularIngredient[];
    
    // Sort to prioritize fundamental ingredients and avoid compound/dish-like results
    data.sort((a, b) => {
      const qLower = query.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // 1. Exact matches always come first
      if (aName === qLower) return -1;
      if (bName === qLower) return 1;
      
      // 2. Shorter strings usually represent raw/base ingredients (egg vs egg noodles)
      return a.name.length - b.name.length;
    });

    return data;
  } catch (err) {
    console.warn('Spoonacular autocomplete error:', err);
    return [];
  }
}

/* ── Get Ingredient Nutrition ── */

// Session-level cache to avoid repeat API calls for the same ingredient
const nutritionCache = new Map<number, SpoonacularNutrition>();

/**
 * Fetch nutrition info for an ingredient by its Spoonacular ID.
 * Returns macros for 100g serving. Results are cached for the session.
 *
 * Endpoint: GET /food/ingredients/{id}/information
 * Docs: https://spoonacular.com/food-api/docs#Get-Ingredient-Information
 */
export async function getIngredientNutrition(
  ingredientId: number,
): Promise<SpoonacularNutrition | null> {
  if (!isSpoonacularConfigured()) return null;

  // Check cache first
  const cached = nutritionCache.get(ingredientId);
  if (cached) return cached;

  try {
    const url = new URL(`${BASE}/food/ingredients/${ingredientId}/information`);
    url.searchParams.set('apiKey', API_KEY!);
    url.searchParams.set('amount', '100');
    url.searchParams.set('unit', 'grams');

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.warn(`Spoonacular ingredient info failed: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const nutrients: { name: string; amount: number }[] = data?.nutrition?.nutrients ?? [];

    const find = (name: string) =>
      nutrients.find(n => n.name.toLowerCase() === name.toLowerCase())?.amount ?? 0;

    const result: SpoonacularNutrition = {
      calories: Math.round(find('Calories')),
      protein: Math.round(find('Protein')),
      carbs: Math.round(find('Carbohydrates')),
      fat: Math.round(find('Fat')),
    };

    nutritionCache.set(ingredientId, result);
    return result;
  } catch (err) {
    console.warn('Spoonacular nutrition error:', err);
    return null;
  }
}

/* ── Debounce Utility ── */

/**
 * Creates a debounced version of an async function.
 * Only the latest invocation within the delay window will execute.
 */
export function debounce<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => { void fn(...args); }, delayMs);
  };
}

/* ── Fetch Real Recipes for AI RAG ── */

/**
 * Fetch a list of recommended real recipes from Spoonacular based on ingredients.
 * Returns up to 15 recipes with full nutrition and instructions.
 * This is used to feed the AI (Llama 3) with real data to select from.
 */
export async function fetchSpoonacularCandidates(ingredients: string[], number = 15): Promise<any[]> {
  if (!isSpoonacularConfigured() || ingredients.length === 0) return [];

  try {
    const url = new URL(`${BASE}/recipes/complexSearch`);
    url.searchParams.set('apiKey', API_KEY!);
    url.searchParams.set('includeIngredients', ingredients.join(','));
    url.searchParams.set('addRecipeInformation', 'true');
    url.searchParams.set('addRecipeNutrition', 'true');
    url.searchParams.set('fillIngredients', 'true');
    url.searchParams.set('instructionsRequired', 'true');
    url.searchParams.set('sort', 'max-used-ingredients'); // Prioritize recipes with fewer missing ingredients
    url.searchParams.set('ranking', '2'); // Minimize missing ingredients
    url.searchParams.set('number', String(number));

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.warn(`Spoonacular complexSearch failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn('Spoonacular complexSearch error:', err);
    return [];
  }
}
