import { useEffect } from 'react';
import {
  CalendarPlus,
  ChefHat,
  Clock3,
  ExternalLink,
  Heart,
  Pencil,
  ShoppingCart,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80';

export default function RecipeDetailModal({ recipe, onClose, onEdit, onDelete, onPlan, onAddToShopping, onToggleFavorite }) {
  useEffect(() => {
    if (!recipe) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [recipe, onClose]);

  if (!recipe) return null;
  const totalTime = Number(recipe.prepTime || 0) + Number(recipe.cookTime || 0);

  const edit = () => { onClose(); onEdit(recipe); };
  const remove = () => { if (onDelete(recipe)) onClose(); };

  return (
    <div className="modal-backdrop recipe-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-card recipe-detail-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-detail-title">
        <button type="button" className="icon-button recipe-detail-close" onClick={onClose} aria-label="סגירת פרטי המתכון"><X size={20} /></button>
        <div className="recipe-detail-hero">
          <img src={recipe.image || FALLBACK_IMAGE} alt={recipe.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }} />
          <span className="recipe-detail-category">{recipe.category || 'כללי'}</span>
        </div>
        <div className="recipe-detail-content">
          <div className="recipe-detail-title-row">
            <div>
              <span className="eyebrow"><ChefHat size={14} /> CHEFBOX RECIPE</span>
              <h2 id="recipe-detail-title">{recipe.name}</h2>
            </div>
            <button type="button" className={`favorite-button recipe-detail-favorite ${recipe.favorite ? 'favorite-button-active' : ''}`} onClick={() => onToggleFavorite(recipe)} aria-label={recipe.favorite ? 'הסרת המתכון מהמועדפים' : 'הוספת המתכון למועדפים'} title={recipe.favorite ? 'הסרה מהמועדפים' : 'הוספה למועדפים'}>
              <Heart size={18} fill={recipe.favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="recipe-detail-stats">
            <span><Clock3 size={17} /><b>{totalTime || '—'}</b> דקות</span>
            {recipe.prepTime > 0 && <span>הכנה: {recipe.prepTime} דק׳</span>}
            {recipe.cookTime > 0 && <span>בישול: {recipe.cookTime} דק׳</span>}
            <span><UsersRound size={17} /><b>{recipe.servings || 2}</b> מנות</span>
          </div>
          {recipe.description && <p className="recipe-detail-description">{recipe.description}</p>}
          <div className="recipe-detail-columns">
            <section className="recipe-detail-section recipe-detail-ingredients">
              <h3>רכיבים <span>{recipe.ingredients?.length || 0}</span></h3>
              {recipe.ingredients?.length ? (
                <ul>{recipe.ingredients.map((ingredient, index) => <li key={`${index}-${ingredient}`}>{ingredient}</li>)}</ul>
              ) : <p className="recipe-detail-empty">לא נשמרו רכיבים למתכון הזה.</p>}
            </section>
            <section className="recipe-detail-section recipe-detail-instructions">
              <h3>אופן ההכנה <span>{recipe.instructions?.length || 0} שלבים</span></h3>
              {recipe.instructions?.length ? (
                <ol>{recipe.instructions.map((instruction, index) => <li key={`${index}-${instruction}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{instruction}</p></li>)}</ol>
              ) : <p className="recipe-detail-empty">לא נשמרו הוראות הכנה למתכון הזה.</p>}
            </section>
          </div>
          <div className="recipe-detail-footer">
            <div className="recipe-detail-actions">
              <button type="button" className="primary-button" onClick={() => { onAddToShopping(recipe); onClose(); }}><ShoppingCart size={16} /> לרשימת קניות</button>
              <button type="button" className="secondary-button" onClick={() => { onPlan(recipe); onClose(); }}><CalendarPlus size={16} /> תכנון ארוחות</button>
              <button type="button" className="secondary-button" onClick={edit}><Pencil size={16} /> עריכה</button>
              {recipe.sourceUrl && <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" className="recipe-detail-source"><ExternalLink size={15} /> מקור המתכון</a>}
            </div>
            <button type="button" className="recipe-detail-delete" onClick={remove}><Trash2 size={15} /> מחיקת מתכון</button>
          </div>
        </div>
      </section>
    </div>
  );
}
