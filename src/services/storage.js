const KEYS = {
  recipes: 'chefbox:recipes:v1',
  mealPlan: 'chefbox:meal-plan:v1',
  shopping: 'chefbox:shopping-list:v1',
  settings: 'chefbox:settings:v1',
  aiApiKey: 'chefbox:ai-api-key:v1',
};

const DEMO_RECIPES = [
  {
    id: 'demo-shakshuka',
    name: 'שקשוקה ירוקה עם תרד',
    category: 'ארוחת בוקר',
    prepTime: 10,
    cookTime: 18,
    servings: 2,
    image: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://example.com/green-shakshuka',
    ingredients: ['4 ביצים', '2 כוסות תרד טרי', '1 בצל קטן קצוץ', '2 שיני שום', '100 גרם גבינת פטה', 'כף שמן זית', 'מלח ופלפל לפי הטעם'],
    instructions: ['מחממים שמן זית במחבת רחבה ומטגנים בצל עד לריכוך.', 'מוסיפים שום ותרד ומערבבים עד שהתרד מצטמצם.', 'יוצרים גומות, שוברים לתוכן את הביצים ומכסים.', 'מבשלים 5–7 דקות, מפזרים פטה ומתבלים לפני ההגשה.'],
    favorite: true,
    createdAt: '2026-09-15T09:00:00.000Z',
  },
  {
    id: 'demo-pasta',
    name: 'פסטה לימון ובזיליקום',
    category: 'ארוחת ערב',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://example.com/lemon-basil-pasta',
    ingredients: ['400 גרם פסטה', 'קליפת לימון מגוררת', 'מיץ מלימון אחד', '3 כפות שמן זית', 'חצי כוס פרמזן', 'חופן עלי בזיליקום', 'מלח ופלפל שחור'],
    instructions: ['מבשלים את הפסטה במים מומלחים לפי הוראות האריזה.', 'שומרים כוס ממי הבישול ומסננים את הפסטה.', 'מערבבים בקערה שמן זית, מיץ וקליפת לימון ופרמזן.', 'מוסיפים פסטה ומעט ממי הבישול, מערבבים ומגישים עם בזיליקום.'],
    favorite: false,
    createdAt: '2026-09-18T11:00:00.000Z',
  },
  {
    id: 'demo-salmon',
    name: 'סלמון בתנור עם ירקות',
    category: 'ארוחת ערב',
    prepTime: 15,
    cookTime: 22,
    servings: 3,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://example.com/oven-salmon',
    ingredients: ['3 נתחי סלמון', '2 קישואים', '1 פלפל אדום', 'עגבניות שרי', '2 כפות שמן זית', 'כפית פפריקה', 'לימון, מלח ופלפל'],
    instructions: ['מחממים תנור ל־200 מעלות ומרפדים תבנית.', 'חותכים את הירקות, מתבלים בשמן זית, פפריקה, מלח ופלפל.', 'מניחים את הסלמון בין הירקות ומתבלים בלימון.', 'אופים 18–22 דקות, עד שהדג מוכן והירקות רכים.'],
    favorite: true,
    createdAt: '2026-09-22T13:30:00.000Z',
  },
  {
    id: 'demo-bowl',
    name: 'קערת קינואה צבעונית',
    category: 'צהריים',
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://example.com/quinoa-bowl',
    ingredients: ['כוס קינואה', 'מלפפון', 'עגבניות שרי', 'אבוקדו', 'חצי כוס גרגירי חומוס', 'טחינה', 'מיץ לימון'],
    instructions: ['שוטפים את הקינואה ומבשלים לפי הוראות האריזה.', 'חותכים את הירקות לקוביות ומסננים את החומוס.', 'מחלקים את הקינואה לקערות ומסדרים מעל את הירקות והחומוס.', 'מזלפים טחינה ומיץ לימון ומגישים.'],
    favorite: false,
    createdAt: '2026-09-25T10:45:00.000Z',
  },
  {
    id: 'demo-cookies',
    name: 'עוגיות שוקולד צ׳יפס רכות',
    category: 'קינוחים',
    prepTime: 15,
    cookTime: 12,
    servings: 18,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://example.com/chocolate-chip-cookies',
    ingredients: ['100 גרם חמאה רכה', 'חצי כוס סוכר חום', 'רבע כוס סוכר לבן', 'ביצה אחת', 'כוס וחצי קמח', 'חצי כפית סודה לשתייה', 'כוס שוקולד צ׳יפס'],
    instructions: ['מחממים תנור ל־180 מעלות ומרפדים תבנית.', 'טורפים חמאה ושני סוגי סוכר, מוסיפים ביצה ומערבבים.', 'מוסיפים קמח וסודה לשתייה ואז מקפלים פנימה שוקולד צ׳יפס.', 'יוצרים כדורים ואופים 10–12 דקות. מצננים לפני ההגשה.'],
    favorite: false,
    createdAt: '2026-09-28T15:20:00.000Z',
  },
  {
    id: 'demo-soup',
    name: 'מרק כתום קטיפתי',
    category: 'מרקים',
    prepTime: 12,
    cookTime: 30,
    servings: 5,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85',
    sourceUrl: 'https://example.com/creamy-orange-soup',
    ingredients: ['דלעת קטנה', '2 גזרים', 'בטטה גדולה', '1 בצל', 'ליטר ציר ירקות', 'כף שמן זית', 'מלח, פלפל וג׳ינג׳ר'],
    instructions: ['קולפים וחותכים את כל הירקות לקוביות.', 'מטגנים בצל בשמן זית 3 דקות ומוסיפים את שאר הירקות.', 'מוסיפים ציר ותבלינים, מביאים לרתיחה ומבשלים כ־25 דקות.', 'טוחנים למרקם חלק ומתקנים תיבול.'],
    favorite: false,
    createdAt: '2026-10-01T12:10:00.000Z',
  },
];

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn(`ChefBox storage read failed for ${key}`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`ChefBox storage write failed for ${key}`, error);
    return false;
  }
}

export function getRecipes() {
  const existing = readJson(KEYS.recipes, null);
  if (Array.isArray(existing)) return existing;
  writeJson(KEYS.recipes, DEMO_RECIPES);
  return DEMO_RECIPES;
}

export function saveRecipe(recipe) {
  const recipes = getRecipes();
  const normalized = {
    ...recipe,
    id: recipe.id || makeId(),
    name: String(recipe.name || '').trim(),
    category: String(recipe.category || 'ללא קטגוריה').trim(),
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.filter(Boolean) : [],
    instructions: Array.isArray(recipe.instructions) ? recipe.instructions.filter(Boolean) : [],
    favorite: Boolean(recipe.favorite),
    updatedAt: new Date().toISOString(),
  };
  const index = recipes.findIndex((item) => item.id === normalized.id);
  if (index >= 0) recipes[index] = normalized;
  else recipes.unshift({ ...normalized, createdAt: normalized.createdAt || new Date().toISOString() });
  writeJson(KEYS.recipes, recipes);
  return normalized;
}

export function deleteRecipe(id) {
  const next = getRecipes().filter((recipe) => recipe.id !== id);
  writeJson(KEYS.recipes, next);
  const plan = getMealPlan();
  for (const day of Object.keys(plan)) {
    plan[day] = (plan[day] || []).filter((recipeId) => recipeId !== id);
    if (!plan[day].length) delete plan[day];
  }
  saveMealPlan(plan);
  const shopping = getShoppingItems().filter((item) => item.sourceRecipeId !== id);
  saveShoppingItems(shopping);
  return next;
}

export function getMealPlan() {
  const value = readJson(KEYS.mealPlan, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function saveMealPlan(plan) {
  writeJson(KEYS.mealPlan, plan);
  return plan;
}

export function getShoppingItems() {
  const value = readJson(KEYS.shopping, []);
  return Array.isArray(value) ? value : [];
}

export function saveShoppingItems(items) {
  writeJson(KEYS.shopping, items);
  return items;
}

export function getSettings() {
  return readJson(KEYS.settings, { compactCards: false, showDemoNote: true, aiModel: 'gpt-5-mini' });
}

export function saveSettings(settings) {
  writeJson(KEYS.settings, settings);
  return settings;
}

// The user's own API key is intentionally stored separately from app settings,
// so it is never included in the JSON backup or the Git repository.
export function getAiApiKey() {
  try {
    return window.localStorage.getItem(KEYS.aiApiKey) || '';
  } catch (error) {
    console.warn('ChefBox could not read the local AI key.', error);
    return '';
  }
}

export function saveAiApiKey(apiKey) {
  try {
    const normalized = String(apiKey || '').trim();
    if (!normalized) throw new Error('יש להזין מפתח API.');
    window.localStorage.setItem(KEYS.aiApiKey, normalized);
    return true;
  } catch (error) {
    console.warn('ChefBox could not save the local AI key.', error);
    throw new Error(error?.message || 'לא ניתן לשמור את המפתח בדפדפן.');
  }
}

export function deleteAiApiKey() {
  try {
    window.localStorage.removeItem(KEYS.aiApiKey);
    return true;
  } catch (error) {
    console.warn('ChefBox could not remove the local AI key.', error);
    throw new Error('לא ניתן למחוק את המפתח מהדפדפן.');
  }
}

export function resetDemoData() {
  writeJson(KEYS.recipes, DEMO_RECIPES);
  writeJson(KEYS.mealPlan, {});
  writeJson(KEYS.shopping, []);
  writeJson(KEYS.settings, { compactCards: false, showDemoNote: true });
  return [...DEMO_RECIPES];
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
