import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  LoaderCircle,
  Plus,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import { parseRecipeFromText, parseRecipeFromUrl } from '../services/aiParser.js';

const emptyDraft = () => ({
  name: '', category: 'ארוחת ערב', prepTime: 15, cookTime: 20, servings: 2,
  image: '', sourceUrl: '', ingredients: [], instructions: [], favorite: false,
});

export default function AddRecipeModal({ isOpen, onClose, onSave, initialRecipe = null }) {
  const [activeTab, setActiveTab] = useState('url');
  const [draft, setDraft] = useState(emptyDraft());
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeKind, setNoticeKind] = useState('success');
  const [showPasteFallback, setShowPasteFallback] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructionsText, setInstructionsText] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const next = initialRecipe ? { ...emptyDraft(), ...initialRecipe } : emptyDraft();
    setDraft(next);
    setUrl(initialRecipe?.sourceUrl || '');
    setIngredientsText((next.ingredients || []).join('\n'));
    setInstructionsText((next.instructions || []).join('\n'));
    setActiveTab(initialRecipe ? 'manual' : 'url');
    setLoading(false);
    setError('');
    setNotice('');
    setNoticeKind('success');
    setShowPasteFallback(false);
    setPastedText('');
  }, [isOpen, initialRecipe]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape' && !loading) onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  async function handleExtract(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    setNoticeKind('success');
    try {
      const parsed = pastedText.trim()
        ? await parseRecipeFromText(url, pastedText)
        : await parseRecipeFromUrl(url);
      const recipeFields = { ...parsed };
      delete recipeFields.parsedBy;
      delete recipeFields.extractionWarning;
      delete recipeFields.totalTime;
      const nextDraft = { ...emptyDraft(), ...recipeFields, favorite: initialRecipe?.favorite || false };
      setDraft(nextDraft);
      setIngredientsText((nextDraft.ingredients || []).join('\n'));
      setInstructionsText((nextDraft.instructions || []).join('\n'));
      const methodLabel = parsed.parsedBy === 'schema.org' ? 'Schema.org' : ['gemini', 'gemini-url-context'].includes(parsed.parsedBy) ? 'Google Gemini' : parsed.parsedBy === 'openai' ? 'OpenAI' : parsed.parsedBy === 'text' ? 'הטקסט שהודבק' : 'העמוד';
      setNoticeKind(parsed.extractionWarning ? 'warning' : 'success');
      setNotice(`החילוץ הסתיים באמצעות ${methodLabel}. ${parsed.extractionWarning || 'מומלץ לעבור על הפרטים לפני השמירה.'}`);
    } catch (extractError) {
      setError(extractError?.message || 'התרחשה שגיאה בחילוץ. נסו שוב או הזינו את המתכון ידנית.');
    } finally {
      setLoading(false);
    }
  }

  function handleSave(event) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError('שם המתכון הוא שדה חובה.');
      setActiveTab('manual');
      return;
    }
    const ingredients = ingredientsText.split('\n').map((line) => line.trim()).filter(Boolean);
    const instructions = instructionsText.split('\n').map((line) => line.trim()).filter(Boolean);
    onSave({
      ...draft,
      name: draft.name.trim(),
      category: draft.category || 'כללי',
      prepTime: Math.max(0, Number(draft.prepTime) || 0),
      cookTime: Math.max(0, Number(draft.cookTime) || 0),
      servings: Math.max(1, Number(draft.servings) || 2),
      sourceUrl: draft.sourceUrl || url.trim(),
      ingredients,
      instructions,
      image: draft.image.trim(),
    });
  }

  const isEdit = Boolean(initialRecipe);
  const hasPreview = Boolean(draft.name && (draft.ingredients?.length || draft.instructions?.length));

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
      <section className="modal-card recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title">
        <div className="modal-header">
          <div>
            <div className="eyebrow"><Sparkles size={14} /> CHEFBOX KITCHEN</div>
            <h2 id="recipe-modal-title">{isEdit ? 'עריכת מתכון' : 'בואו נוסיף משהו טעים'}</h2>
            <p>{isEdit ? 'עדכנו את הפרטים ושמרו את השינויים.' : 'ייבאו מתכון מאתר אהוב או הוסיפו אותו בדרך שלכם.'}</p>
          </div>
          <button className="icon-button modal-close-button" onClick={onClose} aria-label="סגירה" disabled={loading}><X size={20} /></button>
        </div>

        <div className="modal-tabs" role="tablist" aria-label="אופן הוספת מתכון">
          <button role="tab" aria-selected={activeTab === 'url'} className={activeTab === 'url' ? 'modal-tab active' : 'modal-tab'} onClick={() => { setActiveTab('url'); setError(''); }}>
            <Link2 size={17} /> חילוץ מכתובת URL <span className="ai-mini-badge">AI</span>
          </button>
          <button role="tab" aria-selected={activeTab === 'manual'} className={activeTab === 'manual' ? 'modal-tab active' : 'modal-tab'} onClick={() => { setActiveTab('manual'); setError(''); }}>
            <FileText size={17} /> הזנה ידנית
          </button>
        </div>

        <form onSubmit={activeTab === 'url' ? handleExtract : handleSave}>
          <div className="modal-content">
            {activeTab === 'url' ? (
              <div className="extract-panel">
                <label className="field-label" htmlFor="recipe-url">קישור למתכון</label>
                <div className="url-input-row">
                  <div className="url-input-shell"><Link2 size={18} /><input id="recipe-url" type="url" placeholder="https://example.com/my-recipe" value={url} onChange={(event) => setUrl(event.target.value)} required /></div>
                  <button className="primary-button extract-button" type="submit" disabled={loading || !url.trim()}>
                    {loading ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}
                    {loading ? 'מחלצים...' : 'חלצו מתכון'}
                  </button>
                </div>
                <div className="extract-helper"><Sparkles size={14} /><span>ננסה Schema.org ותגיות עמוד. כש־Google Gemini נבחר ומוגדר מפתח, ננסה גם URL Context לקריאת המקור ישירות.</span></div>
                <button type="button" className="text-button extract-paste-toggle" onClick={() => setShowPasteFallback((value) => !value)}>{showPasteFallback ? 'הסתרת שדה הדבקת טקסט' : 'האתר חוסם חילוץ? אפשר להדביק כאן את תוכן המתכון'}</button>
                {showPasteFallback && <div className="field extract-paste-field"><label htmlFor="recipe-pasted-text">תוכן המתכון מהאתר</label><textarea id="recipe-pasted-text" rows="7" value={pastedText} onChange={(event) => setPastedText(event.target.value)} placeholder="פתחו את עמוד המתכון, העתיקו את הכותרת, רשימת הרכיבים והוראות ההכנה והדביקו כאן. אם הוגדר מפתח לספק AI שנבחר בהגדרות, ChefBox תנסה לחלץ מהטקסט." /></div>}

                {error && <div className="inline-alert error-alert"><AlertCircle size={17} /><span>{error}</span></div>}
                {notice && <div className={`inline-alert ${noticeKind === 'warning' ? 'warning-alert' : 'success-alert'}`}><CheckCircle2 size={17} /><span>{notice}</span></div>}

                {hasPreview ? (
                  <div className="extraction-preview">
                    <div className="preview-heading"><div><span className="status-dot" /> תצוגה מקדימה של החילוץ</div><button type="button" className="text-button" onClick={() => setActiveTab('manual')}>עריכת פרטים</button></div>
                    <div className="preview-recipe-row">
                      {draft.image ? <img src={draft.image} alt="תמונת המתכון" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="preview-image-placeholder"><ImageIcon size={24} /></div>}
                      <div className="preview-recipe-info"><h3>{draft.name}</h3><span className="preview-category">{draft.category || 'כללי'}</span><div className="preview-stats"><span><Clock3 size={14} /> {(Number(draft.prepTime) || 0) + (Number(draft.cookTime) || 0)} דקות</span><span><UsersRound size={14} /> {draft.servings || 2} מנות</span></div></div>
                    </div>
                    <div className="preview-columns">
                      <div><h4>רכיבים <span>{draft.ingredients?.length || 0}</span></h4><ul>{(draft.ingredients || []).slice(0, 5).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>{draft.ingredients?.length > 5 && <small>ועוד {draft.ingredients.length - 5} רכיבים</small>}</div>
                      <div><h4>הוראות הכנה <span>{draft.instructions?.length || 0}</span></h4><ol>{(draft.instructions || []).slice(0, 3).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol>{draft.instructions?.length > 3 && <small>ועוד {draft.instructions.length - 3} שלבים</small>}</div>
                    </div>
                    {draft.sourceUrl && <a href={draft.sourceUrl} target="_blank" rel="noreferrer" className="source-link-preview">מעבר לעמוד המקור <ExternalLink size={14} /></a>}
                  </div>
                ) : (
                  <div className="extract-empty-guide"><div className="extract-guide-icon"><Link2 size={23} /></div><strong>המתכון שלכם, בלי להקליד הכול מחדש</strong><p>הדביקו קישור לאתר מתכונים ציבורי. אם האתר חוסם גישה אוטומטית, פתחו את אפשרות הדבקת הטקסט והעתיקו מהעמוד את הרכיבים והוראות ההכנה.</p><span>Schema.org <i /> OpenGraph <i /> Meta tags</span></div>
                )}
              </div>
            ) : (
              <div className="manual-form-grid">
                <div className="field full-field"><label htmlFor="recipe-name">שם המתכון <span className="required-star">*</span></label><input id="recipe-name" value={draft.name} onChange={(event) => update('name', event.target.value)} placeholder="למשל, פסטה שמנת ופטריות" required /></div>
                <div className="field"><label htmlFor="recipe-category">קטגוריה</label><select id="recipe-category" value={draft.category || 'כללי'} onChange={(event) => update('category', event.target.value)}><option>ארוחת בוקר</option><option>צהריים</option><option>ארוחת ערב</option><option>סלטים</option><option>מרקים</option><option>קינוחים</option><option>מאפים</option><option>תוספות</option><option>כללי</option></select></div>
                <div className="field"><label htmlFor="recipe-image">קישור לתמונה</label><input id="recipe-image" type="url" value={draft.image || ''} onChange={(event) => update('image', event.target.value)} placeholder="https://..." dir="ltr" /></div>
                <div className="field"><label htmlFor="recipe-prep">זמן הכנה (דקות)</label><input id="recipe-prep" type="number" min="0" max="1440" value={draft.prepTime ?? 0} onChange={(event) => update('prepTime', event.target.value)} /></div>
                <div className="field"><label htmlFor="recipe-cook">זמן בישול/אפייה (דקות)</label><input id="recipe-cook" type="number" min="0" max="1440" value={draft.cookTime ?? 0} onChange={(event) => update('cookTime', event.target.value)} /></div>
                <div className="field"><label htmlFor="recipe-servings">מספר מנות</label><input id="recipe-servings" type="number" min="1" max="1000" value={draft.servings ?? 2} onChange={(event) => update('servings', event.target.value)} /></div>
                <div className="field"><label htmlFor="recipe-source">קישור למקור (אופציונלי)</label><input id="recipe-source" type="url" value={draft.sourceUrl || ''} onChange={(event) => update('sourceUrl', event.target.value)} placeholder="https://..." dir="ltr" /></div>
                <div className="field full-field"><label htmlFor="recipe-ingredients">רכיבים <span className="field-hint">רכיב אחד בכל שורה</span></label><textarea id="recipe-ingredients" rows="5" value={ingredientsText} onChange={(event) => setIngredientsText(event.target.value)} placeholder={'2 כוסות קמח\n1 כוס חלב\n2 ביצים'} /></div>
                <div className="field full-field"><label htmlFor="recipe-instructions">הוראות הכנה <span className="field-hint">שלב אחד בכל שורה</span></label><textarea id="recipe-instructions" rows="5" value={instructionsText} onChange={(event) => setInstructionsText(event.target.value)} placeholder={'מערבבים את החומרים היבשים.\nמוסיפים את החומרים הרטובים ומערבבים.\nאופים עד להזהבה.'} /></div>
                {error && <div className="inline-alert error-alert full-field"><AlertCircle size={17} /><span>{error}</span></div>}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="secondary-button" type="button" onClick={onClose} disabled={loading}>ביטול</button>
            {activeTab === 'url' && !hasPreview ? (
              <button className="primary-button" type="submit" disabled={loading || !url.trim()}>{loading ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}{loading ? 'מחלצים מתכון' : 'התחלת חילוץ'}</button>
            ) : (
              <button className="primary-button" type="button" onClick={handleSave} disabled={loading || !draft.name.trim()}><Plus size={17} /> {isEdit ? 'שמירת שינויים' : 'שמירת מתכון'}</button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
