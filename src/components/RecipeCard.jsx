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
} from 'lucide-react';
import { useState } from 'react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80';

export default function RecipeCard({ recipe, onToggleFavorite, onDelete, onEdit, onPlan, onAddToShopping }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const time = Number(recipe.prepTime || 0) + Number(recipe.cookTime || 0);
  const ingredientCount = recipe.ingredients?.length || 0;

  return (
    <article className="recipe-card group">
      <div className="recipe-image-wrap">
        <img
          className="recipe-image"
          src={recipe.image || FALLBACK_IMAGE}
          alt={recipe.name}
          loading="lazy"
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }}
        />
        <div className="recipe-image-shade" />
        <span className="recipe-category-pill">{recipe.category || 'כללי'}</span>
        <button
          className={`favorite-button ${recipe.favorite ? 'favorite-button-active' : ''}`}
          onClick={() => onToggleFavorite(recipe)}
          aria-label={recipe.favorite ? 'הסרת המתכון מהמועדפים' : 'הוספת המתכון למועדפים'}
          title={recipe.favorite ? 'הסרה מהמועדפים' : 'הוספה למועדפים'}
        >
          <Heart size={18} fill={recipe.favorite ? 'currentColor' : 'none'} />
        </button>
        <div className="recipe-overflow-wrap">
          <button className="recipe-overflow-button" onClick={() => setMenuOpen((value) => !value)} aria-label="פעולות נוספות"><MoreHorizontal size={20} /></button>
          {menuOpen && (
            <>
              <button className="dropdown-dismiss" aria-label="סגירת תפריט פעולות" onClick={() => setMenuOpen(false)} />
              <div className="recipe-overflow-menu">
                <button onClick={() => { setMenuOpen(false); onEdit(recipe); }}><Pencil size={15} /> עריכת מתכון</button>
                {recipe.sourceUrl && <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}><ExternalLink size={15} /> מעבר למקור</a>}
                <button className="danger-action" onClick={() => { setMenuOpen(false); onDelete(recipe); }}><Trash2 size={15} /> מחיקת מתכון</button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="recipe-card-body">
        <div className="recipe-title-line">
          <h3 title={recipe.name}>{recipe.name}</h3>
        </div>
        <div className="recipe-meta-row">
          <span><Clock3 size={15} /> {time ? `${time} דק׳` : 'זמן לא צוין'}</span>
          <span><UsersRound size={15} /> {recipe.servings || 2} מנות</span>
          <span className="recipe-ingredient-count">{ingredientCount} רכיבים</span>
        </div>
        <div className="recipe-card-footer">
          <button className="recipe-action-button" onClick={() => onAddToShopping(recipe)}><ShoppingCart size={15} /> לרשימת קניות</button>
          <button className="recipe-plan-button" onClick={() => onPlan(recipe)} aria-label={`הוספת ${recipe.name} לתכנון ארוחות`} title="הוספה לתכנון ארוחות"><CalendarPlus size={17} /></button>
        </div>
      </div>
    </article>
  );
}
