import { Bell, Check, ChefHat, ChevronDown, Menu, Search, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Header({ searchValue, onSearchChange, onOpenMobileSidebar }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const onShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  return (
    <header className="app-header">
      <div className="header-mobile-menu">
        <button className="icon-button" onClick={onOpenMobileSidebar} aria-label="פתיחת תפריט"><Menu size={21} /></button>
      </div>

      <div className="header-search-wrap">
        <Search className="header-search-icon" size={19} />
        <input
          ref={searchInputRef}
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="חיפוש מתכון או רכיב..."
          aria-label="חיפוש לפי שם מתכון או רכיב"
        />
        <kbd className="search-shortcut">⌘ K</kbd>
        {searchValue && <button className="search-clear" onClick={() => onSearchChange('')} aria-label="ניקוי חיפוש">×</button>}
      </div>

      <div className="header-actions">
        <div className="popover-anchor">
          <button
            className={`icon-button notification-button ${notificationsOpen ? 'icon-button-selected' : ''}`}
            onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }}
            aria-label="התראות"
            aria-expanded={notificationsOpen}
          >
            <Bell size={19} />
            {!readNotifications && <span className="notification-dot" />}
          </button>
          {notificationsOpen && (
            <div className="header-popover notification-popover">
              <div className="popover-heading"><strong>התראות</strong><button onClick={() => setReadNotifications(true)}><Check size={14} /> סמן כנקרא</button></div>
              <div className="notification-row">
                <span className="notification-bullet"><ChefHat size={16} /></span>
                <div><strong>ברוכים הבאים ל־ChefBox</strong><p>הוסיפו מתכונים, סמנו מועדפים ותכננו את השבוע.</p><small>עכשיו</small></div>
              </div>
              {readNotifications && <div className="all-read-note">אין התראות חדשות</div>}
            </div>
          )}
        </div>
        <div className="popover-anchor profile-anchor">
          <button
            className={`profile-trigger ${profileOpen ? 'profile-trigger-open' : ''}`}
            onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }}
            aria-label="תפריט פרופיל"
            aria-expanded={profileOpen}
          >
            <span className="avatar">ש</span>
            <ChevronDown size={14} className="profile-chevron" />
          </button>
          {profileOpen && (
            <div className="header-popover profile-popover">
              <div className="profile-popover-person"><span className="avatar">ש</span><div><strong>שף הבית</strong><span>חשבון מקומי</span></div></div>
              <div className="profile-popover-divider" />
              <button onClick={() => { setProfileOpen(false); window.dispatchEvent(new CustomEvent('chefbox:navigate', { detail: 'settings' })); }}><UserRound size={16} /> הגדרות החשבון</button>
              <p>הנתונים נשמרים בדפדפן שלך</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
