import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  CircleHelp,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Heart,
  KeyRound,
  Eye,
  EyeOff,
  LoaderCircle,
  Leaf,
  Plus,
  Search,
  ShoppingBasket,
  ShoppingCart,
  Sparkles,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import RecipeCard from './components/RecipeCard.jsx';
import RecipeDetailModal from './components/RecipeDetailModal.jsx';
import AddRecipeModal from './components/AddRecipeModal.jsx';
import EmptyState from './components/EmptyState.jsx';
import {
  deleteRecipe,
  getAiApiKey,
  getMealPlan,
  getRecipes,
  getSettings,
  getShoppingItems,
  resetDemoData,
  saveAiApiKey,
  deleteAiApiKey,
  saveMealPlan,
  saveRecipe,
  saveSettings,
  saveShoppingItems,
} from './services/storage.js';
import { testOpenAiApiKey } from './services/aiParser.js';

const VIEW_META = {
  recipes: { title: 'כל המתכונים', subtitle: 'המתכונים האהובים עליכם, מסודרים במקום אחד.' },
  favorites: { title: 'המועדפים שלי', subtitle: 'כל המתכונים שסימנתם כדי לחזור אליהם בקלות.' },
  mealPlan: { title: 'תכנון ארוחות', subtitle: 'תכנון שבועי פשוט שעוזר לדעת מה מבשלים בכל יום.' },
  shopping: { title: 'רשימת קניות', subtitle: 'כל מה שצריך לקנות, מתוך המתכונים שבחרתם.' },
  settings: { title: 'הגדרות', subtitle: 'ניהול הנתונים וההעדפות של סביבת ChefBox המקומית.' },
};

const CATEGORIES = ['הכל', 'ארוחת בוקר', 'צהריים', 'ארוחת ערב', 'סלטים', 'מרקים', 'קינוחים', 'מאפים', 'תוספות'];
const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const HEBREW_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekDays(today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      key: localDateKey(date),
      name: HEBREW_DAYS[date.getDay()],
      dayNumber: date.getDate(),
      month: HEBREW_MONTHS[date.getMonth()],
      isToday: localDateKey(date) === localDateKey(today),
    };
  });
}

function makeClientId() {
  return globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [recipes, setRecipes] = useState(() => getRecipes());
  const [activeView, setActiveView] = useState('recipes');
  const [searchValue, setSearchValue] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('הכל');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [mealPlan, setMealPlan] = useState(() => getMealPlan());
  const [shoppingItems, setShoppingItems] = useState(() => getShoppingItems());
  const [settings, setSettings] = useState(() => getSettings());
  const [aiApiKey, setAiApiKey] = useState(() => getAiApiKey());
  const [toast, setToast] = useState(null);
  const [shoppingFilter, setShoppingFilter] = useState('all');

  const showToast = useCallback((message, kind = 'success') => {
    setToast({ message, kind, id: Date.now() });
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(null), 3400);
  }, []);

  useEffect(() => {
    const navigate = (event) => {
      if (VIEW_META[event.detail]) setActiveView(event.detail);
    };
    window.addEventListener('chefbox:navigate', navigate);
    return () => window.removeEventListener('chefbox:navigate', navigate);
  }, []);

  useEffect(() => {
    if (activeView !== 'recipes' && activeView !== 'favorites') setCategoryFilter('הכל');
  }, [activeView]);

  const favoriteCount = useMemo(() => recipes.filter((recipe) => recipe.favorite).length, [recipes]);
  const pendingShoppingCount = useMemo(() => shoppingItems.filter((item) => !item.checked).length, [shoppingItems]);
  const visibleRecipes = useMemo(() => {
    let result = activeView === 'favorites' ? recipes.filter((recipe) => recipe.favorite) : recipes;
    const search = searchValue.trim().toLocaleLowerCase('he');
    if (search) {
      result = result.filter((recipe) => [recipe.name, recipe.category, ...(recipe.ingredients || [])]
        .some((value) => String(value || '').toLocaleLowerCase('he').includes(search)));
    }
    if (categoryFilter !== 'הכל') result = result.filter((recipe) => recipe.category === categoryFilter);
    return result;
  }, [recipes, activeView, searchValue, categoryFilter]);

  const openAddModal = useCallback(() => {
    setEditingRecipe(null);
    setModalOpen(true);
  }, []);

  const handleNavigate = (view) => {
    setActiveView(view);
    setSearchValue('');
    setMobileSidebarOpen(false);
  };

  const handleSaveRecipe = (recipe) => {
    const isEdit = Boolean(recipe.id && recipes.some((item) => item.id === recipe.id));
    saveRecipe(recipe);
    setRecipes(getRecipes());
    setModalOpen(false);
    setEditingRecipe(null);
    showToast(isEdit ? 'המתכון עודכן בהצלחה' : 'המתכון נוסף לספרייה שלך');
    setActiveView('recipes');
  };

  const handleViewRecipe = (recipe) => setViewingRecipe(recipe);

  const handleEditRecipe = (recipe) => {
    setViewingRecipe(null);
    setEditingRecipe(recipe);
    setModalOpen(true);
  };

  const handleDeleteRecipe = (recipe) => {
    const answer = window.confirm(`למחוק את המתכון ״${recipe.name}״? הפעולה תסיר גם אותו מתכנון הארוחות.`);
    if (!answer) return false;
    deleteRecipe(recipe.id);
    setRecipes(getRecipes());
    setMealPlan(getMealPlan());
    setShoppingItems(getShoppingItems());
    showToast('המתכון נמחק', 'info');
    return true;
  };

  const handleToggleFavorite = (recipe) => {
    const updated = { ...recipe, favorite: !recipe.favorite };
    saveRecipe(updated);
    setRecipes(getRecipes());
    setViewingRecipe((current) => current?.id === recipe.id ? updated : current);
    showToast(recipe.favorite ? 'המתכון הוסר מהמועדפים' : 'המתכון נשמר במועדפים');
  };

  const handlePlanRecipe = (recipe, dayKey = localDateKey(new Date())) => {
    setMealPlan((current) => {
      const currentIds = current[dayKey] || [];
      if (currentIds.includes(recipe.id)) {
        showToast('המתכון כבר נמצא בתכנון ליום הזה', 'info');
        return current;
      }
      const next = { ...current, [dayKey]: [...currentIds, recipe.id] };
      saveMealPlan(next);
      showToast(`${recipe.name} נוסף לתכנון הארוחות`);
      return next;
    });
  };

  const handleRemovePlannedRecipe = (dayKey, recipeId) => {
    setMealPlan((current) => {
      const next = { ...current };
      next[dayKey] = (next[dayKey] || []).filter((id) => id !== recipeId);
      if (!next[dayKey].length) delete next[dayKey];
      saveMealPlan(next);
      return next;
    });
    showToast('המתכון הוסר מתכנון הארוחות', 'info');
  };

  const handleAddToShopping = (recipe) => {
    const current = getShoppingItems();
    const known = new Set(current.map((item) => normalizeIngredient(item.name)));
    const additions = (recipe.ingredients || [])
      .map((name) => String(name).trim())
      .filter((name) => name && !known.has(normalizeIngredient(name)))
      .map((name) => ({ id: makeClientId(), name, checked: false, sourceRecipeId: recipe.id, createdAt: new Date().toISOString() }));
    const next = [...additions, ...current];
    saveShoppingItems(next);
    setShoppingItems(next);
    if (additions.length) showToast(`${additions.length} פריטים נוספו לרשימת הקניות`);
    else showToast('כל הרכיבים מהמתכון כבר נמצאים ברשימה', 'info');
  };

  const handleToggleShoppingItem = (itemId) => {
    setShoppingItems((current) => {
      const next = current.map((item) => item.id === itemId ? { ...item, checked: !item.checked } : item);
      saveShoppingItems(next);
      return next;
    });
  };

  const handleAddManualShoppingItem = (name) => {
    const clean = name.trim();
    if (!clean) return;
    if (shoppingItems.some((item) => normalizeIngredient(item.name) === normalizeIngredient(clean))) {
      showToast('הפריט כבר קיים ברשימה', 'info');
      return;
    }
    const next = [{ id: makeClientId(), name: clean, checked: false, sourceRecipeId: null, createdAt: new Date().toISOString() }, ...shoppingItems];
    saveShoppingItems(next);
    setShoppingItems(next);
  };

  const handleDeleteShoppingItem = (itemId) => {
    const next = shoppingItems.filter((item) => item.id !== itemId);
    saveShoppingItems(next);
    setShoppingItems(next);
  };

  const handleClearCompleted = () => {
    const next = shoppingItems.filter((item) => !item.checked);
    saveShoppingItems(next);
    setShoppingItems(next);
    showToast('הפריטים שסומנו נקנו הוסרו');
  };

  const handleSettingsChange = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const handleSaveAiApiKey = (key) => {
    const normalizedKey = String(key || '').trim();
    saveAiApiKey(normalizedKey);
    setAiApiKey(normalizedKey);
    showToast('מפתח ה־API נשמר בדפדפן הזה');
  };

  const handleDeleteAiApiKey = () => {
    deleteAiApiKey();
    setAiApiKey('');
    showToast('מפתח ה־API נמחק מהדפדפן', 'info');
  };

  const handleResetDemo = () => {
    const answer = window.confirm('לאפס את ChefBox לנתוני הדוגמה? המתכונים, תכנון הארוחות ורשימת הקניות המקומיים יוחלפו.');
    if (!answer) return;
    const nextRecipes = resetDemoData();
    setRecipes(nextRecipes);
    setMealPlan({});
    setShoppingItems([]);
    setSettings(getSettings());
    setSearchValue('');
    setActiveView('recipes');
    showToast('נתוני הדוגמה שוחזרו');
  };

  const handleExport = () => {
    const backup = {
      app: 'ChefBox',
      exportedAt: new Date().toISOString(),
      recipes,
      mealPlan,
      shoppingItems,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `chefbox-backup-${localDateKey(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    showToast('קובץ הגיבוי הורד למחשב');
  };

  const viewMeta = VIEW_META[activeView] || VIEW_META.recipes;
  const currentWeek = useMemo(() => getWeekDays(new Date()), []);
  const plannedMealCount = Object.values(mealPlan).reduce((sum, ids) => sum + (Array.isArray(ids) ? ids.length : 0), 0);

  return (
    <div className="chefbox-app" dir="rtl">
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        onAddRecipe={openAddModal}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        favoriteCount={favoriteCount}
        shoppingCount={pendingShoppingCount}
      />

      <div className={`app-main ${sidebarCollapsed ? 'app-main-collapsed' : ''}`}>
        <Header searchValue={searchValue} onSearchChange={setSearchValue} onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="main-content">
          <div className="content-container">
            {activeView === 'recipes' || activeView === 'favorites' ? (
              <>
                <section className="welcome-banner">
                  <div className="welcome-copy">
                    <span className="welcome-eyebrow"><Sparkles size={14} /> קצת השראה למטבח</span>
                    <h1>{activeView === 'favorites' ? 'הטעמים שתמיד חוזרים אליהם' : 'המטבח שלכם. הסיפור שלכם.'}</h1>
                    <p>{activeView === 'favorites' ? 'ריכזנו כאן את כל המתכונים שסימנתם כמועדפים.' : 'כל הרעיונות, הטעמים והמתכונים האהובים — במקום אחד.'}</p>
                    <div className="welcome-actions">
                      <button className="primary-button" onClick={openAddModal}><Plus size={17} /> הוספת מתכון חדש</button>
                      <button className="welcome-secondary" onClick={() => handleNavigate('mealPlan')}><CalendarDays size={17} /> תכנון השבוע</button>
                    </div>
                  </div>
                  <div className="welcome-art" aria-hidden="true">
                    <div className="welcome-art-circle circle-one" />
                    <div className="welcome-art-circle circle-two" />
                    <div className="welcome-art-note note-top"><Leaf size={15} /> fresh ideas</div>
                    <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=760&q=85" alt="" />
                    <div className="welcome-art-note note-bottom"><span className="note-star">✳</span> made with love</div>
                  </div>
                  <div className="welcome-sprinkle sprinkle-a">✳</div><div className="welcome-sprinkle sprinkle-b">✦</div>
                </section>

                <section className="quick-stats" aria-label="סיכום הספרייה">
                  <div className="quick-stat"><span className="quick-stat-icon stat-green"><Utensils size={19} /></span><div><strong>{recipes.length}</strong><span>מתכונים בספרייה</span></div></div>
                  <div className="quick-stat"><span className="quick-stat-icon stat-rose"><Heart size={19} /></span><div><strong>{favoriteCount}</strong><span>מתכונים מועדפים</span></div></div>
                  <div className="quick-stat"><span className="quick-stat-icon stat-amber"><CalendarDays size={19} /></span><div><strong>{plannedMealCount}</strong><span>ארוחות מתוכננות</span></div></div>
                </section>

                <section className="recipes-section">
                  <div className="section-header-row">
                    <div><div className="section-overline">הספרייה הקולינרית</div><h2>{viewMeta.title}</h2><p>{searchValue ? `תוצאות חיפוש עבור ״${searchValue}״` : `${visibleRecipes.length} מתכונים שמחכים לכם`}</p></div>
                    <div className="section-header-actions"><span className="sort-label"><span className="sort-dot" /> ממוינים לפי הוספה</span><button className="secondary-button compact-button" onClick={openAddModal}><Plus size={16} /> הוספה</button></div>
                  </div>
                  <div className="category-chips" aria-label="סינון לפי קטגוריה">
                    {CATEGORIES.map((category) => <button key={category} className={`category-chip ${categoryFilter === category ? 'category-chip-active' : ''}`} onClick={() => setCategoryFilter(category)}>{category}</button>)}
                  </div>

                  {visibleRecipes.length ? (
                    <div className={`recipe-grid ${settings.compactCards ? 'recipe-grid-compact' : ''}`}>
                      {visibleRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} onView={handleViewRecipe} onToggleFavorite={handleToggleFavorite} onDelete={handleDeleteRecipe} onEdit={handleEditRecipe} onPlan={handlePlanRecipe} onAddToShopping={handleAddToShopping} />)}
                    </div>
                  ) : (
                    <EmptyState icon={activeView === 'favorites' ? Heart : Search} title={searchValue ? 'לא מצאנו מתכונים מתאימים' : activeView === 'favorites' ? 'עוד אין כאן מועדפים' : 'הספרייה שלכם מחכה למתכון הראשון'} description={searchValue ? 'נסו מילות חיפוש אחרות או הסירו את הסינון לפי קטגוריה.' : activeView === 'favorites' ? 'לחצו על הלב בכרטיס מתכון כדי לשמור אותו כאן.' : 'הוסיפו מתכון ידנית או חלצו אותו מקישור של אתר מתכונים.'} actionLabel={searchValue ? 'ניקוי החיפוש' : 'הוספת מתכון'} onAction={searchValue ? () => { setSearchValue(''); setCategoryFilter('הכל'); } : openAddModal} />
                  )}
                </section>

                {settings.showDemoNote && recipes.some((recipe) => String(recipe.id).startsWith('demo-')) && (
                  <div className="demo-note"><span><CircleHelp size={16} /></span><p><strong>מתחילים עם השראה.</strong> חלק מהמתכונים שמופיעים כאן הם נתוני דוגמה, כדי שתוכלו להכיר את ChefBox. אפשר לערוך אותם או למחוק אותם בכל עת.</p><button onClick={() => handleSettingsChange('showDemoNote', false)} aria-label="סגירת הודעת הדגמה"><X size={16} /></button></div>
                )}
              </>
            ) : activeView === 'mealPlan' ? (
              <MealPlanView week={currentWeek} recipes={recipes} mealPlan={mealPlan} onAdd={handlePlanRecipe} onRemove={handleRemovePlannedRecipe} onNavigateRecipes={() => handleNavigate('recipes')} />
            ) : activeView === 'shopping' ? (
              <ShoppingView items={shoppingItems} onToggle={handleToggleShoppingItem} onDelete={handleDeleteShoppingItem} onAddManual={handleAddManualShoppingItem} onClearCompleted={handleClearCompleted} filter={shoppingFilter} onFilterChange={setShoppingFilter} onNavigateRecipes={() => handleNavigate('recipes')} />
            ) : (
              <SettingsView settings={settings} onChange={handleSettingsChange} onExport={handleExport} onReset={handleResetDemo} recipeCount={recipes.length} apiKey={aiApiKey} onSaveApiKey={handleSaveAiApiKey} onDeleteApiKey={handleDeleteAiApiKey} onTestApiKey={(key) => testOpenAiApiKey(key, settings.aiModel || 'gpt-5-mini')} />
            )}

            <footer className="app-footer"><span>© 2026 ChefBox</span><span>בישול טוב מתחיל בתכנון טוב <span className="footer-heart">♥</span></span><span className="footer-status"><i /> הנתונים נשמרים מקומית</span></footer>
          </div>
        </main>
      </div>

      <RecipeDetailModal recipe={viewingRecipe} onClose={() => setViewingRecipe(null)} onEdit={handleEditRecipe} onDelete={handleDeleteRecipe} onPlan={handlePlanRecipe} onAddToShopping={handleAddToShopping} onToggleFavorite={handleToggleFavorite} />
      <AddRecipeModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingRecipe(null); }} onSave={handleSaveRecipe} initialRecipe={editingRecipe} />
      {toast && <div className={`toast toast-${toast.kind}`} role="status"><span className="toast-icon">{toast.kind === 'success' ? <Check size={17} /> : <CircleHelp size={17} />}</span><span>{toast.message}</span><button onClick={() => setToast(null)} aria-label="סגירת הודעה"><X size={15} /></button></div>}
    </div>
  );
}

function normalizeIngredient(name) {
  return String(name || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('he');
}

function MealPlanView({ week, recipes, mealPlan, onAdd, onRemove, onNavigateRecipes }) {
  const recipesById = useMemo(() => new Map(recipes.map((recipe) => [recipe.id, recipe])), [recipes]);
  const plannedCount = Object.values(mealPlan).reduce((sum, ids) => sum + (Array.isArray(ids) ? ids.length : 0), 0);
  return (
    <>
      <PageIntro icon={CalendarDays} eyebrow="מתכננים קדימה" title="תכנון ארוחות" subtitle="תכננו מראש, קנו בדיוק מה שצריך, והשאירו יותר מקום ליהנות מהאוכל." />
      <section className="planner-summary-row">
        <div className="planner-summary-card"><span className="planner-summary-icon"><CalendarDays size={20} /></span><div><strong>{plannedCount}</strong><span>ארוחות מתוכננות</span></div></div>
        <div className="planner-summary-card"><span className="planner-summary-icon planner-summary-orange"><ShoppingBasket size={20} /></span><div><strong>{recipes.length}</strong><span>מתכונים לבחירה</span></div></div>
        <button className="primary-button" onClick={onNavigateRecipes}><Plus size={17} /> מציאת מתכון</button>
      </section>
      <div className="week-heading"><div><span className="section-overline">היומן השבועי שלכם</span><h2>השבוע במטבח</h2></div><span className="week-range">{week[0]?.dayNumber} {week[0]?.month} – {week[6]?.dayNumber} {week[6]?.month}</span></div>
      <section className="week-grid">
        {week.map((day) => {
          const ids = Array.isArray(mealPlan[day.key]) ? mealPlan[day.key] : [];
          return (
            <article className={`day-column ${day.isToday ? 'day-column-today' : ''}`} key={day.key}>
              <header className="day-column-header"><span>{day.name}</span><strong className={day.isToday ? 'day-number-today' : ''}>{day.dayNumber}</strong>{day.isToday && <small>היום</small>}</header>
              <div className="day-meals-list">
                {ids.map((id) => {
                  const recipe = recipesById.get(id);
                  if (!recipe) return null;
                  return <div className="planned-recipe" key={id}><img src={recipe.image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=200&q=70'} alt="" /><div><strong>{recipe.name}</strong><span><Clock3 size={12} /> {(Number(recipe.prepTime || 0) + Number(recipe.cookTime || 0)) || '—'} {Number(recipe.prepTime || 0) + Number(recipe.cookTime || 0) ? 'דק׳' : ''}</span></div><button onClick={() => onRemove(day.key, id)} aria-label={`הסרת ${recipe.name} מהתכנון`}><X size={14} /></button></div>;
                })}
                {!ids.length && <div className="day-empty"><span><Utensils size={17} /></span><small>עוד לא תכננתם<br />ארוחה ליום הזה</small></div>}
              </div>
              <select className="day-add-select" defaultValue="" aria-label={`הוספת מתכון ליום ${day.name}`} onChange={(event) => { if (event.target.value) onAdd(recipesById.get(event.target.value), day.key); event.target.value = ''; }}>
                <option value="">+ הוספת מתכון</option>
                {recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}
              </select>
            </article>
          );
        })}
      </section>
      <div className="planner-tip"><span><Sparkles size={17} /></span><div><strong>טיפ קטן לחיסכון בזמן</strong><p>הוסיפו מתכונים לתכנון השבוע, ואז צרו רשימת קניות מכל רכיביהם בלחיצה אחת מתוך כרטיסי המתכון.</p></div></div>
    </>
  );
}

function ShoppingView({ items, onToggle, onDelete, onAddManual, onClearCompleted, filter, onFilterChange, onNavigateRecipes }) {
  const [newItem, setNewItem] = useState('');
  const pending = items.filter((item) => !item.checked).length;
  const checked = items.length - pending;
  const displayed = items.filter((item) => filter === 'pending' ? !item.checked : filter === 'checked' ? item.checked : true);
  const submitItem = (event) => {
    event.preventDefault();
    if (!newItem.trim()) return;
    onAddManual(newItem);
    setNewItem('');
  };
  return (
    <>
      <PageIntro icon={ShoppingBasket} eyebrow="מגיעים מוכנים לסופר" title="רשימת הקניות שלי" subtitle="אספו את כל הרכיבים במקום אחד וסמנו אותם תוך כדי הקנייה." />
      <section className="shopping-summary-row">
        <div className="shopping-summary-main"><span className="shopping-summary-icon"><ShoppingCart size={22} /></span><div><strong>{pending} <small>פריטים שנותרו</small></strong><span>{checked ? `${checked} פריטים כבר סומנו כנקנו` : 'סמנו פריט אחרי שהכנסתם אותו לעגלה'}</span></div></div>
        <div className="shopping-progress"><div className="shopping-progress-label"><span>התקדמות</span><strong>{items.length ? Math.round((checked / items.length) * 100) : 0}%</strong></div><div className="shopping-progress-track"><span style={{ width: `${items.length ? (checked / items.length) * 100 : 0}%` }} /></div></div>
      </section>
      <section className="shopping-list-panel">
        <div className="shopping-panel-header"><div><h2>כל הפריטים</h2><p>{items.length} פריטים ברשימה</p></div><div className="shopping-panel-actions"><select value={filter} onChange={(event) => onFilterChange(event.target.value)} aria-label="סינון פריטי רשימת קניות"><option value="all">כל הפריטים</option><option value="pending">לקנייה</option><option value="checked">נקנו</option></select>{checked > 0 && <button className="text-button" onClick={onClearCompleted}><CheckCheck size={15} /> ניקוי פריטים שנקנו</button>}</div></div>
        <form className="add-shopping-item-form" onSubmit={submitItem}><Plus size={18} /><input value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="הוסיפו פריט נוסף לרשימה..." aria-label="שם פריט חדש" /><button type="submit" className="primary-button" disabled={!newItem.trim()}>הוספה</button></form>
        {displayed.length ? <div className="shopping-items-list">{displayed.map((item) => <div className={`shopping-item-row ${item.checked ? 'shopping-item-checked' : ''}`} key={item.id}><button className="shopping-check" onClick={() => onToggle(item.id)} aria-label={item.checked ? `ביטול סימון ${item.name}` : `סימון ${item.name} כנקנה`}>{item.checked && <Check size={14} />}</button><span className="shopping-item-name">{item.name}</span>{item.sourceRecipeId && <span className="shopping-item-origin">מתכון</span>}<button className="shopping-delete-button" onClick={() => onDelete(item.id)} aria-label={`מחיקת ${item.name}`}><Trash2 size={15} /></button></div>)}</div> : <EmptyState icon={ShoppingBasket} title={filter === 'checked' ? 'עדיין לא סימנתם פריטים' : filter === 'pending' ? 'כל הפריטים נקנו!' : 'רשימת הקניות ריקה'} description={filter === 'all' ? 'הוסיפו פריט ידנית או הוסיפו רכיבים מתוך אחד המתכונים שלכם.' : 'שנו את הסינון או הוסיפו רכיבים חדשים לרשימה.'} actionLabel={filter === 'all' ? 'בחירת מתכונים' : undefined} onAction={onNavigateRecipes} />}
      </section>
    </>
  );
}

function SettingsView({ settings, onChange, onExport, onReset, recipeCount, apiKey, onSaveApiKey, onDeleteApiKey, onTestApiKey }) {
  const [draftApiKey, setDraftApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState('');
  const [keyStatusKind, setKeyStatusKind] = useState('info');
  const [testingKey, setTestingKey] = useState(false);

  const saveKey = () => {
    const normalized = draftApiKey.trim();
    if (!normalized) {
      setKeyStatus('הזינו מפתח חדש לפני השמירה.');
      setKeyStatusKind('error');
      return;
    }
    try {
      onSaveApiKey(normalized);
      setDraftApiKey('');
      setShowApiKey(false);
      setKeyStatus('המפתח נשמר במכשיר הזה. הוא לא ייכלל בגיבוי המתכונים.');
      setKeyStatusKind('success');
    } catch (error) {
      setKeyStatus(error?.message || 'לא ניתן לשמור את המפתח.');
      setKeyStatusKind('error');
    }
  };

  const testKey = async () => {
    const keyToTest = draftApiKey.trim() || apiKey;
    if (!keyToTest) {
      setKeyStatus('הזינו מפתח API או שמרו מפתח לפני הבדיקה.');
      setKeyStatusKind('error');
      return;
    }
    setTestingKey(true);
    setKeyStatus('');
    try {
      await onTestApiKey(keyToTest);
      setKeyStatus('החיבור ל־OpenAI הצליח והמפתח התקבל.');
      setKeyStatusKind('success');
    } catch (error) {
      setKeyStatus(error?.message || 'בדיקת המפתח נכשלה.');
      setKeyStatusKind('error');
    } finally {
      setTestingKey(false);
    }
  };

  const removeKey = () => {
    try {
      onDeleteApiKey();
      setDraftApiKey('');
      setKeyStatus('המפתח הוסר מהדפדפן.');
      setKeyStatusKind('info');
    } catch (error) {
      setKeyStatus(error?.message || 'לא ניתן למחוק את המפתח.');
      setKeyStatusKind('error');
    }
  };

  return (
    <>
      <PageIntro icon={ClipboardList} eyebrow="שליטה בחוויה שלכם" title="הגדרות ChefBox" subtitle="התאימו את סביבת העבודה וניהלו את הנתונים שנשמרים במכשיר הזה." />
      <div className="settings-layout">
        <section className="settings-panel settings-panel-wide ai-settings-panel">
          <div className="settings-panel-title">
            <span className="settings-panel-icon"><KeyRound size={19} /></span>
            <div><h2>מפתח API אישי לחילוץ AI</h2><p>כל משתמש יכול להזין את המפתח שלו. השימוש נעשה ישירות מהדפדפן, בלי מפתח משותף בקוד האתר.</p></div>
          </div>
          <div className="api-key-status-row">
            <span className={`api-key-status-dot ${apiKey ? 'api-key-status-dot-active' : ''}`} />
            <div><strong>{apiKey ? 'מפתח אישי מוגדר בדפדפן הזה' : 'לא הוגדר מפתח API'}</strong><span>{apiKey ? 'הערך עצמו מוסתר. אפשר להחליף אותו או להסירו.' : 'ללא מפתח, חילוץ Schema.org ו־Meta ימשיך לפעול ככל שהאתר מאפשר.'}</span></div>
          </div>
          <div className="api-key-form-row">
            <div className="api-key-input-wrap">
              <label htmlFor="chefbox-api-key">מפתח OpenAI API</label>
              <div className="api-key-input-shell">
                <input
                  id="chefbox-api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={draftApiKey}
                  onChange={(event) => setDraftApiKey(event.target.value)}
                  placeholder={apiKey ? 'מפתח שמור — הזינו כאן מפתח חדש להחלפה' : 'הדביקו את מפתח ה־API האישי שלכם'}
                  autoComplete="off"
                  spellCheck="false"
                  dir="ltr"
                />
                <button type="button" className="api-key-visibility-button" aria-label={showApiKey ? 'הסתרת המפתח' : 'הצגת המפתח'} onClick={() => setShowApiKey((value) => !value)}>
                  {showApiKey ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div className="api-key-button-stack">
              <button type="button" className="primary-button" onClick={saveKey} disabled={!draftApiKey.trim()}><KeyRound size={16} /> שמירת מפתח</button>
              <button type="button" className="secondary-button" onClick={testKey} disabled={testingKey || (!draftApiKey.trim() && !apiKey)}>{testingKey ? <LoaderCircle className="spin" size={16} /> : <CheckCircle2 size={16} />}{testingKey ? 'בודקים...' : 'בדיקת מפתח'}</button>
              {apiKey && <button type="button" className="text-button api-key-remove" onClick={removeKey}>מחיקת המפתח השמור</button>}
            </div>
          </div>
          <div className="api-model-row">
            <div className="api-key-input-wrap"><label htmlFor="chefbox-ai-model">מודל AI</label><input id="chefbox-ai-model" className="settings-text-input" value={settings.aiModel || 'gpt-5-mini'} onChange={(event) => onChange('aiModel', event.target.value)} placeholder="gpt-5-mini" dir="ltr" /></div>
            <p>הזינו מזהה מודל שזמין בפרויקט OpenAI שלכם. שימוש במודל עשוי להיות כרוך בעלות לפי התעריפים של ספק ה־API.</p>
          </div>
          {keyStatus && <div className={`inline-alert api-key-feedback ${keyStatusKind === 'error' ? 'error-alert' : keyStatusKind === 'success' ? 'success-alert' : ''}`} role="status">{keyStatusKind === 'success' ? <CheckCircle2 size={17} /> : <CircleHelp size={17} />}<span>{keyStatus}</span></div>}
          <div className="api-key-warning"><span><CircleHelp size={17} /></span><p><strong>חשוב לדעת:</strong> האתר סטטי והמפתח משמש ישירות בדפדפן ונשמר ב־LocalStorage של הדפדפן הזה. הוא לא נשלח למאגר Git ולא נכלל בקובץ הגיבוי, אך אינו מוגן כמו מפתח שנשמר בשרת. אל תשתמשו במפתח בעל הרשאות רחבות, ואל תגדירו מפתח במחשב ציבורי. <a href="https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety" target="_blank" rel="noreferrer">הנחיות OpenAI לאבטחת מפתחות</a>.</p></div>
        </section>

        <section className="settings-panel"><div className="settings-panel-title"><span className="settings-panel-icon"><Utensils size={19} /></span><div><h2>העדפות תצוגה</h2><p>הגדירו איך תיראה ספריית המתכונים שלכם.</p></div></div>
          <SettingToggle title="כרטיסיות קומפקטיות" description="הציגו יותר מתכונים בכל שורה עם פחות רווחים." checked={Boolean(settings.compactCards)} onChange={(value) => onChange('compactCards', value)} />
          <SettingToggle title="הודעת נתוני דוגמה" description="הציגו הסבר כשהספרייה כוללת מתכונים לדוגמה." checked={Boolean(settings.showDemoNote)} onChange={(value) => onChange('showDemoNote', value)} />
        </section>
        <section className="settings-panel"><div className="settings-panel-title"><span className="settings-panel-icon settings-icon-orange"><ArrowDownToLine size={19} /></span><div><h2>גיבוי נתונים</h2><p>הורידו קובץ JSON עם המתכונים, התכנון ורשימת הקניות.</p></div></div><div className="backup-info-row"><div><strong>{recipeCount} מתכונים</strong><span>שמורים בדפדפן הנוכחי</span></div><button className="secondary-button" onClick={onExport}><ArrowDownToLine size={16} /> ייצוא גיבוי</button></div><p className="settings-note">המידע נשמר ב־LocalStorage של הדפדפן. הוא לא מסתנכרן אוטומטית בין מכשירים או דפדפנים. שמרו גיבוי לפני ניקוי נתוני גלישה.</p></section>
        <section className="settings-panel settings-danger-panel"><div className="settings-panel-title"><span className="settings-panel-icon settings-icon-red"><Trash2 size={19} /></span><div><h2>איפוס נתונים</h2><p>שחזרו את האפליקציה למצב התחלתי לצורך הדגמה.</p></div></div><div className="backup-info-row"><div><strong>שחזור נתוני הדוגמה</strong><span>המתכונים האישיים, התכנון והרשימה יוחלפו.</span></div><button className="danger-button" onClick={onReset}><Trash2 size={15} /> איפוס נתונים</button></div></section>
      </div>
    </>
  );
}

function SettingToggle({ title, description, checked, onChange }) {
  return <div className="setting-toggle-row"><div><strong>{title}</strong><p>{description}</p></div><button className={`switch ${checked ? 'switch-on' : ''}`} role="switch" aria-checked={checked} aria-label={title} onClick={() => onChange(!checked)}><span /></button></div>;
}

function PageIntro({ icon: Icon, eyebrow, title, subtitle }) {
  return <section className="page-intro"><div className="page-intro-icon"><Icon size={23} /></div><div><span className="section-overline">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div></section>;
}
