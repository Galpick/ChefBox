import {
  CalendarPlus,
  Clock3,
  ExternalLink,
  Heart,
  MoreHorizontal,
  Pencil,
  ShoppingCart,
  Trash2,
  UsersRound,
  Eye,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80';

export default function RecipeCard({ recipe, onView, onToggleFavorite, onDelete, onEdit, onPlan, onAddToShopping }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const time = Number(recipe.prepTime || 0) + Number(recipe.cookTime || 0);
  const ingredientCount = recipe.ingredients?.length || 0;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <article className="recipe-card">
      <div className="recipe-image-wrap">
        <button type="button" className="recipe-image-open" onClick={() => onView(recipe)} aria-label={`צפייה במתכון ${recipe.name}`}>
          <img
            className="recipe-image"
            src={recipe.image || FALLBACK_IMAGE}
            alt={recipe.name}
            loading="lazy"
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }}
          />
        </button>
        <div className="recipe-image-shade" />
        <span className="recipe-category-pill">{recipe.category || 'כללי'}</span>
        <button
          type="button"
          className={`favorite-button ${recipe.favorite ? 'favorite-button-active' : ''}`}
          onClick={() => onToggleFavorite(recipe)}
          aria-label={recipe.favorite ? 'הסרת המתכון מהמועדפים' : 'הוספת המתכון למועדפים'}
          title={recipe.favorite ? 'הסרה מהמועדפים' : 'הוספה למועדפים'}
        >
          <Heart size={18} fill={recipe.favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="recipe-card-body">
        <div className="recipe-title-line">
          <button type="button" className="recipe-title-button" onClick={() => onView(recipe)} title={`צפייה במתכון ${recipe.name}`}>
            {recipe.name}
          </button>
        </div>
        <div className="recipe-meta-row">
          <span><Clock3 size={15} /> {time ? `${time} דק׳` : 'זמן לא צוין'}</span>
          <span><UsersRound size={15} /> {recipe.servings || 2} מנות</span>
          <span className="recipe-ingredient-count">{ingredientCount} רכיבים</span>
        </div>
        <div className="recipe-card-footer">
          <div className="recipe-card-primary-actions">
            <button type="button" className="recipe-view-button" onClick={() => onView(recipe)}><Eye size={15} /> צפייה במתכון</button>
            <button type="button" className="recipe-edit-button" onClick={() => onEdit(recipe)}><Pencil size={15} /> עריכה</button>
          </div>
          <div className="recipe-card-secondary-actions">
            <button type="button" className="recipe-mini-action" onClick={() => onAddToShopping(recipe)} aria-label={`הוספת רכיבי ${recipe.name} לרשימת הקניות`} title="הוספה לרשימת קניות"><ShoppingCart size={16} /></button>
            <button type="button" className="recipe-mini-action" onClick={() => onPlan(recipe)} aria-label={`הוספת ${recipe.name} לתכנון ארוחות`} title="תכנון ארוחות"><CalendarPlus size={16} /></button>
            <div className="recipe-overflow-wrap" ref={menuRef}>
              <button type="button" className="recipe-mini-action recipe-overflow-button" onClick={() => setMenuOpen((value) => !value)} aria-label="פעולות נוספות" aria-expanded={menuOpen} title="פעולות נוספות"><MoreHorizontal size={18} /></button>
              {menuOpen && (
                <div className="recipe-overflow-menu">
                  {recipe.sourceUrl && <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}><ExternalLink size={15} /> מעבר למקור</a>}
                  <button type="button" className="danger-action" onClick={() => { setMenuOpen(false); onDelete(recipe); }}><Trash2 size={15} /> מחיקת מתכון</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
