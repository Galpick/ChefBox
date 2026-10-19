# ChefBox

אפליקציית React לניהול מתכונים, חילוץ מתכון מכתובת URL, מועדפים, תכנון ארוחות ורשימת קניות. הממשק בעברית, תומך RTL ורספונסיבי למחשב ולמובייל. הפרויקט מותאם ל־GitHub ולפריסה סטטית ב־GitHub Pages — ללא Vercel וללא backend משלכם.

## תיקונים בגרסה המעודכנת

- לחיצה על תמונת המתכון, הכותרת או "צפייה במתכון" פותחת חלון פרטים עם רכיבים, שלבי הכנה, מקור ופעולות עריכה/תכנון/רשימת קניות.
- פעולות העריכה והצפייה אינן מוסתרות עוד בתוך תפריט שנחתך על ידי אזור התמונה.
- חילוץ המתכונים כולל מספר שירותי Proxy כחלופות, חילוץ היוריסטי מכותרות בעברית, שמירה על שבירות שורה עבור AI, הודעות שגיאה ברורות ואפשרות להדביק את הטקסט של המתכון כשהאתר חוסם גישה.
- ניתן לבחור בין OpenAI ל־Google Gemini; Gemini משתמש גם ב־URL Context כדי לנסות לקרוא עמוד מקור ישירות כש־CORS Proxy נכשל.
- נוספו התחברות Google, יצירת גיבוי JSON בתיקיית Drive ייעודית, וייבוא קבצים בפורמט JSON או CSV תוך דילוג על מתכונים כפולים.

## דרישות מקדימות

- Node.js 20.19 ומעלה (מומלץ Node.js 22)
- npm

## הרצה מקומית

```bash
npm install
npm run dev
```

Vite יציג את כתובת הפיתוח בטרמינל, בדרך כלל `http://localhost:5173`.

## יצירת אתר סטטי

```bash
npm run build
npm run preview
```

הקבצים להעלאה נוצרים בתיקיית `dist/`. הגדרת `base: './'` ב־`vite.config.js` מאפשרת טעינת נכסים גם כאשר האתר נמצא בנתיב פרויקט של GitHub Pages.

## העלאה ל־GitHub ופריסה אוטומטית ב־GitHub Pages

1. צרו repository חדש ב־GitHub.
2. העתיקו אליו את כל קובצי הפרויקט, כולל התיקייה `.github/workflows`.
3. בצעו commit ודחיפה לענף `main` (או עדכנו את שם הענף בקובץ ה־workflow אם הענף הראשי שלכם נקרא אחרת).
4. ב־GitHub פתחו **Settings → Pages** והגדירו את **Build and deployment → Source** ל־**GitHub Actions**.
5. בכל push לענף `main`, workflow בשם **Deploy ChefBox to GitHub Pages** יבנה את הפרויקט ויפרסם את `dist/`.

פקודות Git לדוגמה:

```bash
git init
git add .
git commit -m "Create ChefBox recipe manager"
git branch -M main
git remote add origin https://github.com/YOUR-USER/YOUR-REPOSITORY.git
git push -u origin main
```

החליפו את `YOUR-USER` ו־`YOUR-REPOSITORY` בפרטים של המאגר שלכם. אל תעלו ל־Git מפתחות API, קובצי `.env` או נתונים אישיים.

## מפתח Gemini / OpenAI אישי לכל משתמש

- במסך **הגדרות** בוחרים ספק AI: Google Gemini או OpenAI. ניתן להזין, לבדוק, להחליף ולמחוק מפתח נפרד לכל ספק.
- מפתחות נשמרים בנפרד ב־LocalStorage של הדפדפן ומכשיר זה. הם לא נכנסים ל־Git, ולא נכללים בגיבוי JSON או בגיבוי ל־Drive.
- ברירת המחדל ל־Gemini היא `gemini-3.8-flash`; ברירת המחדל ל־OpenAI היא `gpt-5-mini`. ניתן לשנות את מזהה המודל בהגדרות בהתאם לזמינות בחשבון.
- כפתור **פתיחת Google AI Studio ליצירת מפתח** פותח את מסך המפתחות הרשמי. משתמשים חדשים עשויים לקבל פרויקט ומפתח ברירת מחדל אחרי אישור התנאים, אבל ChefBox לא יכולה לקרוא או להעתיק מפתח אוטומטית מאתר Google אחר. יש להעתיק את המפתח ולהדביק אותו בשדה. יצירה אוטומטית מלאה הייתה מחייבת ניהול פרויקט Google Cloud והרשאות IAM מורחבות, ולכן אינה מופעלת בדפדפן סטטי.
- Gemini URL Context מאפשר למודל לנסות לקרוא את כתובת המקור ישירות, בנוסף לטקסט שחולץ מקומית. זה אינו מבטיח גישה לכל אתר או עמוד חסום.

**אזהרת אבטחה:** Gemini ו־OpenAI ממליצים לא לחשוף מפתחות API בסביבת צד־לקוח בפרודקשן. ChefBox סטטית ולכן מפתח המשתמש נשלח מהדפדפן לספק ה־AI ועלול להיחשף אם מישהו משתמש באותו פרופיל דפדפן או אם האתר נפגע ב־XSS. יש להשתמש במפתחות אישיים מוגבלים, לא במחשב ציבורי, ולהפעיל מגבלות/ניטור אצל הספק. ראו [הנחיות אבטחת מפתחות Gemini](https://ai.google.dev/gemini-api/docs/api-key) ו[הנחיות OpenAI](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety). לאבטחה חזקה יותר נדרש backend שיחזיק מפתחות מחוץ לדפדפן.

## התחברות Google וגיבוי ל־Drive

ChefBox יכולה לבקש אישור לחשבון Google וליצור קובצי JSON בתיקייה `ChefBox Backups` ב־Google Drive. הרשאת Drive היא `drive.file`, שנועדה לגישה לקבצים שהאפליקציה יוצרת או שהמשתמש בוחר. אסימון הגישה נשאר בזיכרון הדף ואינו נשמר ב־LocalStorage; לאחר רענון, יש להתחבר מחדש לפני גיבוי נוסף.

### הגדרה חד־פעמית לבעל האתר

1. פתחו [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials) ובחרו/צרו פרויקט.
2. הפעילו את **Google Drive API** לפרויקט.
3. השלימו את הגדרות Google Auth Platform / OAuth consent screen.
4. צרו **OAuth Client ID** מסוג **Web application**.
5. תחת **Authorized JavaScript origins** הוסיפו את מקור GitHub Pages שלכם, למשל `https://USERNAME.github.io` (ללא שם המאגר בסוף). הוסיפו גם `http://localhost:5173` אם רוצים לבדוק מקומית.
6. במאגר GitHub פתחו **Settings → Secrets and variables → Actions → Variables → New repository variable**. הזינו שם `GOOGLE_CLIENT_ID` וערך ה־Client ID שנוצר. זהו מזהה ציבורי, לא מפתח סודי.
7. דחפו Commit חדש או הריצו מחדש את Workflow של Pages כדי לבנות את האתר עם המזהה. אפשר גם להזין Client ID בשדה ההגדרות בדפדפן לצורך בדיקה מקומית בלבד.
8. ב־ChefBox פתחו **הגדרות → חשבון Google וגיבוי ל־Drive**, לחצו על התחברות ואשרו את ההרשאות. אחרי ההתחברות לחצו על **גיבוי ל־Drive עכשיו**.

המשתמש צריך לאשר את הרשאות Google. ChefBox אינה יכולה לבצע התחברות או לשמור גיבוי בלי הסכמה זו. מסמכים רשמיים: [Drive API JavaScript quickstart](https://developers.google.com/workspace/drive/api/quickstart/js), [Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/overview).

## ייבוא מתכונים מקובץ

במסך **הגדרות → ייבוא מתכונים מקובץ** אפשר לבחור:

- קובץ JSON שנוצר באמצעות **ייצוא גיבוי** של ChefBox.
- מערך JSON של מתכונים, או אובייקט המכיל את השדה `recipes`.
- CSV עם כותרות כגון `name`, `category`, `prepTime`, `cookTime`, `servings`, `sourceUrl`, `ingredients`, `instructions`. ברכיבים ובהוראות ניתן להפריד בין ערכים באמצעות `|` או `;`.

הייבוא ממזג מתכונים חדשים לתוך הספרייה הקיימת. מתכון שהשם או כתובת המקור שלו כבר קיימים יידלג, כדי למנוע כפילויות. מפתחות API והרשאות Google אינם מיובאים.

## חילוץ מתכונים מ־URL

`src/services/aiParser.js` מנסה:

1. לשלוף HTML באמצעות Proxy שהוגדר בזמן build או מספר שירותי Proxy חלופיים.
2. לחלץ `Schema.org/Recipe` מתוך `application/ld+json`.
3. להשלים נתונים מ־OpenGraph, תגיות Meta והטקסט הגלוי בעמוד.
4. אם Gemini נבחר ומוגדר מפתח, להשתמש ב־Gemini `URL Context` וגם בטקסט שחולץ; אם הדפדפן לא הצליח להוריד HTML, לנסות את כתובת המקור ישירות דרך URL Context.
5. לחלופין, אפשר לבחור OpenAI, או להדביק טקסט מהעמוד במודאל החילוץ.

URL Context לא יכול לגשת לכל URL (למשל אתרים הדורשים כניסה, תוכן חסום או פורמטים שאינם נתמכים). מפתח API אינו עוקף חסימות לכל האתרים. שירותי Proxy ציבוריים הם צד שלישי והזמינות שלהם אינה בשליטת ChefBox.

## נתונים ופרטיות

- המתכונים, המועדפים, תכנון הארוחות, רשימת הקניות וההעדפות נשמרים מקומית בדפדפן.
- מפתחות Gemini ו־OpenAI נשמרים בנפרד ואינם נכללים בקובץ הגיבוי.
- גיבוי Drive נשמר בתיקייה נפרדת ב־Google Drive; נדרשת הרשאת משתמש פעילה בכל סשן.
- הנתונים אינם מסתנכרנים בין משתמשים או מכשירים. מחיקת נתוני האתר בדפדפן עלולה להסיר אותם; מומלץ לייצא גיבוי.

## מבנה הפרויקט

```text
chefbox/
├── .github/workflows/deploy.yml
├── src/
│   ├── components/
│   ├── services/
│   │   ├── aiParser.js
│   │   ├── googleDrive.js
│   │   └── storage.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```
