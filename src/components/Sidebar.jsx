import {
  CalendarDays,
  ChefHat,
  ChevronLeft,
  Heart,
  LayoutGrid,
  Plus,
  Settings,
  ShoppingBasket,
  PanelRightClose,
  PanelRightOpen,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'recipes', label: 'כל המתכונים', icon: LayoutGrid },
  { id: 'favorites', label: 'מועדפים', icon: Heart },
  { id: 'mealPlan', label: 'תכנון ארוחות', icon: CalendarDays },
  { id: 'shopping', label: 'רשימת קניות', icon: ShoppingBasket },
  { id: 'settings', label: 'הגדרות', icon: Settings },
];

export default function Sidebar({
  activeView,
  onNavigate,
  collapsed,
  onToggle,
  onAddRecipe,
  mobileOpen,
  onCloseMobile,
  favoriteCount = 0,
  shoppingCount = 0,
}) {
  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" aria-label="סגירת תפריט" onClick={onCloseMobile} />}
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-topline">
          <button className="brand-lockup" onClick={() => onNavigate('recipes')} aria-label="ChefBox — עמוד המתכונים">
            <span className="brand-mark"><ChefHat size={22} strokeWidth={2.2} /></span>
            {!collapsed && <span className="brand-word">Chef<span>Box</span></span>}
          </button>
          <button className="sidebar-close-mobile icon-button" onClick={onCloseMobile} aria-label="סגירת תפריט">
            <X size={19} />
          </button>
        </div>

        <button className="add-recipe-button" onClick={onAddRecipe} title={collapsed ? 'מתכון חדש' : undefined}>
          <Plus size={18} strokeWidth={2.5} />
          {!collapsed && <span>מתכון חדש</span>}
        </button>

        {!collapsed && <div className="nav-section-label">הספרייה שלי</div>}
        <nav className="sidebar-nav" aria-label="ניווט ראשי">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const selected = activeView === id;
            const count = id === 'favorites' ? favoriteCount : id === 'shopping' ? shoppingCount : 0;
            return (
              <button
                key={id}
                className={`nav-item ${selected ? 'nav-item-active' : ''}`}
                onClick={() => { onNavigate(id); onCloseMobile?.(); }}
                title={collapsed ? label : undefined}
                aria-current={selected ? 'page' : undefined}
              >
                <Icon size={19} strokeWidth={selected ? 2.25 : 1.9} />
                {!collapsed && <span className="nav-item-label">{label}</span>}
                {!collapsed && count > 0 && <span className="nav-count">{count}</span>}
                {collapsed && <span className="nav-tooltip">{label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        {!collapsed && (
          <div className="sidebar-tip">
            <div className="sidebar-tip-icon"><ChefHat size={18} /></div>
            <div>
              <p className="sidebar-tip-title">המתכון הבא שלך מחכה</p>
              <p className="sidebar-tip-copy">שמרו מתכונים שאהבתם והפכו כל ארוחה לקלה יותר.</p>
            </div>
            <ChevronLeft size={16} className="sidebar-tip-chevron" />
          </div>
        )}

        <div className="sidebar-bottom">
          <button className="collapse-button" onClick={onToggle} aria-label={collapsed ? 'הרחבת תפריט' : 'צמצום תפריט'}>
            {collapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
            {!collapsed && <span>צמצום תפריט</span>}
          </button>
          <div className="sidebar-user">
            <div className="avatar avatar-sidebar">ש</div>
            {!collapsed && <div className="sidebar-user-info"><strong>שף הבית</strong><span>החשבון שלי</span></div>}
          </div>
        </div>
      </aside>
    </>
  );
}
