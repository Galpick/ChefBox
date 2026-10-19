const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';
const DRIVE_SCOPE = 'openid email profile https://www.googleapis.com/auth/drive.file';

let activeAccessToken = '';
let activeTokenExpiresAt = 0;
let activeAccountEmail = '';
let activeFolderId = '';

export function getBuiltInGoogleClientId() {
  return String(import.meta.env?.VITE_GOOGLE_CLIENT_ID || '').trim();
}

export function preloadGoogleIdentityServices() {
  return ensureIdentityServices().catch((error) => {
    console.warn('ChefBox Google integration is not ready yet:', error);
    return false;
  });
}

function ensureIdentityServices() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let script = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
    const createdHere = !script;
    if (!script) {
      script = document.createElement('script');
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
    }
    let settled = false;
    const cleanup = () => {
      window.clearTimeout(timeout);
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    };
    const done = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };
    const onLoad = () => {
      if (window.google?.accounts?.oauth2) done(resolve);
      else done(reject, new Error('Google Identity Services נטען, אך ממשק ההזדהות אינו זמין.'));
    };
    const onError = () => {
      if (createdHere) script.remove();
      done(reject, new Error('לא ניתן לטעון את שירותי Google. בדקו חסימת רשת או תוספי פרטיות.'));
    };
    const timeout = window.setTimeout(() => done(reject, new Error('טעינת שירותי Google נמשכה זמן רב מדי. רעננו את העמוד ונסו שוב.')), 12000);
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    if (createdHere) document.head.appendChild(script);
    // If an earlier attempt already loaded the script, its load event will not fire a second time.
    if (window.google?.accounts?.oauth2) done(resolve);
  });
}

async function driveRequest(url, options = {}) {
  if (!activeAccessToken || Date.now() >= activeTokenExpiresAt - 15000) {
    throw new Error('החיבור ל־Google Drive פג. התחברו מחדש לחשבון Google.');
  }
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${activeAccessToken}`,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('לא ניתן להתחבר ל־Google Drive. בדקו את חיבור האינטרנט.');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) throw new Error('Google ביטל או פג תוקף ההרשאה. התחברו מחדש.');
    if (response.status === 403) throw new Error('ל־ChefBox אין הרשאה ל־Google Drive. בדקו את ההרשאות שאישרתם ואת הגדרות Drive API.');
    throw new Error(body?.error?.message || `Google Drive החזיר שגיאה ${response.status}.`);
  }
  return body;
}

/** Ask the current user to authenticate with Google and authorize ChefBox to create its backup files. */
export async function connectGoogleDrive(clientId) {
  const normalizedClientId = String(clientId || '').trim();
  if (!normalizedClientId) {
    throw new Error('חסר Google OAuth Client ID. הגדירו את GOOGLE_CLIENT_ID במשתני המאגר או הזינו Client ID בהגדרות ChefBox.');
  }
  await ensureIdentityServices();

  const tokenResponse = await new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: normalizedClientId,
        scope: DRIVE_SCOPE,
        include_granted_scopes: true,
        callback: (response) => {
          if (response?.error) {
            reject(new Error(response.error_description || response.error || 'ההזדהות מול Google בוטלה.'));
            return;
          }
          if (!response?.access_token) {
            reject(new Error('Google לא החזיר אסימון הרשאה. נסו שוב.'));
            return;
          }
          resolve(response);
        },
        error_callback: (error) => reject(new Error(error?.message || 'חלון ההזדהות של Google לא נפתח. אפשרו חלונות קופצים ונסו שוב.')),
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (error) {
      reject(error);
    }
  });

  activeAccessToken = tokenResponse.access_token;
  activeTokenExpiresAt = Date.now() + Math.max(60, Number(tokenResponse.expires_in || 3600)) * 1000;
  activeFolderId = '';

  let profile;
  try {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${activeAccessToken}` },
    });
    profile = await response.json();
    if (!response.ok) throw new Error(profile?.error_description || 'לא ניתן לקרוא את פרטי החשבון.');
  } catch (error) {
    activeAccessToken = '';
    activeTokenExpiresAt = 0;
    throw new Error(error?.message || 'לא ניתן לאמת את חשבון Google.');
  }

  activeAccountEmail = String(profile?.email || '');
  return { email: activeAccountEmail, name: String(profile?.name || ''), picture: String(profile?.picture || '') };
}

async function getOrCreateBackupFolder() {
  if (activeFolderId) return activeFolderId;
  const q = encodeURIComponent("name = 'ChefBox Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const found = await driveRequest(`${DRIVE_API}?q=${q}&spaces=drive&pageSize=20&fields=files(id,name)`);
  const existing = (found.files || [])[0];
  if (existing?.id) {
    activeFolderId = existing.id;
    return activeFolderId;
  }
  const created = await driveRequest(`${DRIVE_API}?fields=id,name`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'ChefBox Backups', mimeType: 'application/vnd.google-apps.folder' }),
  });
  if (!created.id) throw new Error('Google Drive לא החזיר מזהה לתיקיית הגיבוי.');
  activeFolderId = created.id;
  return activeFolderId;
}

/** Create a timestamped JSON backup under a visible "ChefBox Backups" Drive folder. */
export async function backupToGoogleDrive(backupObject) {
  const folderId = await getOrCreateBackupFolder();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const metadata = {
    name: `ChefBox-backup-${timestamp}.json`,
    mimeType: 'application/json',
    parents: [folderId],
  };
  const boundary = `chefbox-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const content = JSON.stringify(backupObject, null, 2);
  const multipartBody = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    content,
    `--${boundary}--`,
    '',
  ].join('\r\n');
  const file = await driveRequest(`${DRIVE_UPLOAD_API}?uploadType=multipart&fields=id,name,webViewLink`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: multipartBody,
  });
  if (!file.id) throw new Error('הגיבוי לא נוצר ב־Google Drive.');
  return { id: file.id, name: file.name, webViewLink: file.webViewLink || `https://drive.google.com/drive/u/0/search?q=${encodeURIComponent(file.name)}`, email: activeAccountEmail };
}

export function getGoogleDriveSession() {
  if (!activeAccessToken || Date.now() >= activeTokenExpiresAt - 15000) return null;
  return { email: activeAccountEmail };
}

export function disconnectGoogleDrive() {
  if (activeAccessToken && window.google?.accounts?.oauth2?.revoke) {
    try { window.google.accounts.oauth2.revoke(activeAccessToken, () => {}); } catch { /* Best effort revocation. */ }
  }
  activeAccessToken = '';
  activeTokenExpiresAt = 0;
  activeAccountEmail = '';
  activeFolderId = '';
}
