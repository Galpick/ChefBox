# ChefBox

אפליקציית React לניהול מתכונים, חילוץ מתכון מכתובת URL, מועדפים, תכנון ארוחות ורשימת קניות. הממשק בעברית, תומך RTL ורספונסיבי למחשב ולמובייל. הפרויקט מותאם ל־GitHub ולפריסה סטטית ב־GitHub Pages — ללא Vercel וללא backend משלכם.

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

## מפתח API אישי לכל משתמש (Bring Your Own Key)

- במסך **הגדרות** ניתן להגדיר, להחליף, לבדוק או למחוק מפתח OpenAI אישי.
- המפתח נשמר ב־`LocalStorage` של אותו דפדפן ומכשיר. הוא אינו נמצא בקוד, אינו נשלח ל־GitHub ואינו נכלל בגיבוי JSON של המתכונים.
- משתמשים בדפדפנים/פרופילים שונים יכולים להגדיר מפתחות שונים. אין מערכת חשבונות או סנכרון מפתחות בין מכשירים.
- ניתן לשנות את מזהה המודל בהגדרות. ברירת המחדל היא `gpt-5-mini`; יש לבחור מודל הזמין לפרויקט ה־OpenAI של המשתמש.
- המפתח משמש ישירות מתוך הדפדפן באמצעות OpenAI API כאשר החילוץ המובנה אינו מספיק. שימוש ב־API עשוי להיות כרוך בעלויות של המשתמש מול OpenAI.

**אזהרת אבטחה:** OpenAI ממליצה לא לחשוף מפתחות API בסביבות צד־לקוח. באתר סטטי אין שכבת שרת שתסתיר את המפתח; הוא נשמר מקומית אך עלול להיחשף אם משתמש אחר ניגש לפרופיל הדפדפן או אם האתר נפגע ב־XSS. מומלץ ליצור מפתח ייעודי עם הרשאות מינימליות ולהגדיר מגבלות/ניטור בחשבון OpenAI. ראו את [הנחיות OpenAI לאבטחת מפתחות](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety). לפריסה ציבורית רגישה, הפתרון הבטוח יותר הוא backend עם אימות, הגבלת קצב וניהול סודות בצד השרת.

## חילוץ מתכונים מ־URL

`src/services/aiParser.js` מנסה:

1. לשלוף את ה־HTML דרך Proxy ציבורי עם תמיכה ב־CORS. אפשר להגדיר `VITE_RECIPE_PROXY_URL` ב־`.env.local` כדי להשתמש ב־Proxy משלכם; אין צורך במפתח API עבור Proxy זה.
2. לחלץ `Schema.org/Recipe` מתוך `application/ld+json`.
3. אם הסכמה חסרה, להשתמש ב־OpenGraph וב־Meta tags.
4. אם החילוץ עדיין חלקי והמשתמש שמר מפתח API אישי, לשלוח את הטקסט הגלוי בעמוד ל־OpenAI לצורך חילוץ משלים.

חילוץ מ־URL תלוי ביכולת ה־Proxy לשלוף את עמוד המקור. אתרים מסוימים חוסמים בקשות אוטומטיות, מחייבים JavaScript או אינם מפרסמים נתוני מתכון תקניים. במקרה כזה יש לנסות קישור אחר או להזין את המתכון ידנית. ה־Proxy הציבורי הוא שירות צד שלישי, וזמינותו ומדיניותו אינן בשליטת ChefBox.

## נתונים ופרטיות

- המתכונים, המועדפים, תכנון הארוחות, רשימת הקניות וההעדפות נשמרים מקומית בדפדפן.
- מפתח OpenAI נשמר בנפרד ואינו נכלל בקובץ הגיבוי.
- הנתונים אינם מסתנכרנים בין משתמשים או מכשירים. מחיקת נתוני האתר בדפדפן עלולה להסיר אותם; מומלץ לייצא גיבוי.

## מבנה הפרויקט

```text
chefbox/
├── .github/workflows/deploy.yml
├── src/
│   ├── components/
│   ├── services/
│   │   ├── aiParser.js
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
