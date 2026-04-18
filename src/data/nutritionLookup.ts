/* ── Per-ingredient approximate macros per standard serving ──────────
   Values are intentionally conservative estimates for a single serving. */

export interface Macros {
  calories: number;
  protein: number;   // g
  carbs: number;     // g
  fat: number;       // g
}

const DB: Record<string, Macros> = {
  /* ── Grains & Carbs ── */
  'Rice':         { calories: 200, protein: 4,  carbs: 45, fat: 0.5 },
  'Wheat Flour':  { calories: 110, protein: 3,  carbs: 23, fat: 0.5 },
  'Bread':        { calories: 130, protein: 4,  carbs: 26, fat: 1.5 },
  'Noodles':      { calories: 220, protein: 7,  carbs: 43, fat: 2   },
  'Pasta':        { calories: 220, protein: 8,  carbs: 43, fat: 1.5 },
  /* ── Legumes ── */
  'Toor Dal':     { calories: 200, protein: 11, carbs: 35, fat: 1   },
  'Moong Dal':    { calories: 180, protein: 12, carbs: 30, fat: 1   },
  'Lentils':      { calories: 190, protein: 13, carbs: 32, fat: 1   },
  'Beans':        { calories: 130, protein: 8,  carbs: 22, fat: 0.5 },
  'Peas':         { calories: 80,  protein: 5,  carbs: 14, fat: 0.5 },
  /* ── Dairy ── */
  'Milk':         { calories: 60,  protein: 3,  carbs: 5,  fat: 3   },
  'Curd':         { calories: 60,  protein: 4,  carbs: 5,  fat: 3   },
  'Paneer':       { calories: 265, protein: 18, carbs: 3,  fat: 20  },
  'Cheese':       { calories: 200, protein: 12, carbs: 1,  fat: 16  },
  'Butter':       { calories: 90,  protein: 0,  carbs: 0,  fat: 10  },
  'Ghee':         { calories: 100, protein: 0,  carbs: 0,  fat: 11  },
  /* ── Proteins ── */
  'Eggs':         { calories: 155, protein: 13, carbs: 1,  fat: 11  },
  'Egg':          { calories: 155, protein: 13, carbs: 1,  fat: 11  },
  'Chicken':      { calories: 240, protein: 27, carbs: 0,  fat: 14  },
  'Fish':         { calories: 130, protein: 20, carbs: 0,  fat: 5   },
  'Salmon':       { calories: 200, protein: 22, carbs: 0,  fat: 12  },
  'Shrimp':       { calories: 100, protein: 20, carbs: 1,  fat: 1.5 },
  /* ── Vegetables ── */
  'Tomato':       { calories: 18,  protein: 1,  carbs: 4,  fat: 0   },
  'Onion':        { calories: 40,  protein: 1,  carbs: 9,  fat: 0   },
  'Garlic':       { calories: 15,  protein: 1,  carbs: 3,  fat: 0   },
  'Ginger':       { calories: 10,  protein: 0,  carbs: 2,  fat: 0   },
  'Potato':       { calories: 80,  protein: 2,  carbs: 18, fat: 0   },
  'Sweet Potato': { calories: 90,  protein: 2,  carbs: 21, fat: 0   },
  'Carrot':       { calories: 40,  protein: 1,  carbs: 10, fat: 0   },
  'Spinach':      { calories: 20,  protein: 2,  carbs: 3,  fat: 0   },
  'Broccoli':     { calories: 30,  protein: 3,  carbs: 6,  fat: 0   },
  'Cauliflower':  { calories: 25,  protein: 2,  carbs: 5,  fat: 0   },
  'Cabbage':      { calories: 20,  protein: 1,  carbs: 5,  fat: 0   },
  'Corn':         { calories: 90,  protein: 3,  carbs: 19, fat: 1   },
  'Mushroom':     { calories: 20,  protein: 3,  carbs: 3,  fat: 0   },
  'Eggplant':     { calories: 20,  protein: 1,  carbs: 5,  fat: 0   },
  'Bell Pepper':  { calories: 25,  protein: 1,  carbs: 6,  fat: 0   },
  'Cucumber':     { calories: 15,  protein: 1,  carbs: 3,  fat: 0   },
  /* ── Fruits ── */
  'Banana':       { calories: 90,  protein: 1,  carbs: 23, fat: 0   },
  'Apple':        { calories: 70,  protein: 0,  carbs: 19, fat: 0   },
  'Orange':       { calories: 60,  protein: 1,  carbs: 15, fat: 0   },
  'Mango':        { calories: 100, protein: 1,  carbs: 25, fat: 0   },
  'Lemon':        { calories: 10,  protein: 0,  carbs: 3,  fat: 0   },
  /* ── Fats & Condiments ── */
  'Oil':          { calories: 120, protein: 0,  carbs: 0,  fat: 14  },
  'Sugar':        { calories: 100, protein: 0,  carbs: 25, fat: 0   },
  /* ── Spices (tiny amounts — minimal calories) ── */
  'Turmeric':         { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Cumin Seeds':      { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Coriander Powder': { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Coriander':        { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Red Chilli Powder':{ calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Chilli':           { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Garam Masala':     { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Salt':             { calories: 0, protein: 0, carbs: 0, fat: 0 },
  'Mustard Seeds':    { calories: 5, protein: 0, carbs: 0, fat: 0 },
  'Black Pepper':     { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Cardamom':         { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Cloves':           { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Cinnamon':         { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Hing':             { calories: 2, protein: 0, carbs: 0, fat: 0 },
  'Jeera Powder':     { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Amchur':           { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Kasuri Methi':     { calories: 5, protein: 0, carbs: 1, fat: 0 },
  'Bay Leaves':       { calories: 2, protein: 0, carbs: 0, fat: 0 },
};

/** Estimate combined macros for a list of ingredients */
export function estimateMacros(ingredients: string[]): Macros {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const name of ingredients) {
    const entry = DB[name];
    if (entry) {
      calories += entry.calories;
      protein  += entry.protein;
      carbs    += entry.carbs;
      fat      += entry.fat;
    } else {
      calories += 25; // Unknown ingredient — conservative default
    }
  }
  return {
    calories: Math.round(calories),
    protein:  Math.round(protein),
    carbs:    Math.round(carbs),
    fat:      Math.round(fat),
  };
}

/** Look up macros for a single ingredient from the static DB */
export function lookupIngredient(name: string): Macros | null {
  return DB[name] ?? null;
}
