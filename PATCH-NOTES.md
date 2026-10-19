# ChefBox patch notes

This update fixes recipe-card navigation, the clipped edit menu, and recipe extraction.

## Files changed

- `src/App.jsx` — wires the recipe detail modal and updates favorite state while viewing a recipe.
- `src/components/RecipeCard.jsx` — adds visible view/edit actions and moves the overflow menu outside the clipped image area.
- `src/components/RecipeDetailModal.jsx` — new detail modal showing ingredients and cooking instructions.
- `src/components/AddRecipeModal.jsx` — shows extraction warnings and supports pasting recipe page text when a site blocks automated fetching.
- `src/services/aiParser.js` — more CORS proxy fallbacks, Hebrew text heuristics, improved instruction splitting, clearer network/API errors, and a real Responses API model check.
- `src/index.css` — action and detail-modal styles.
- `README.md` — updated behavior and troubleshooting documentation.

## Apply to an existing GitHub repository

Copy/replace these paths in the local repository, add the new `src/components/RecipeDetailModal.jsx`, then commit and push them to `main`. The existing GitHub Pages workflow can deploy the update automatically.

```bash
git add src/App.jsx src/components/RecipeCard.jsx src/components/RecipeDetailModal.jsx src/components/AddRecipeModal.jsx src/services/aiParser.js src/index.css README.md PATCH-NOTES.md
git commit -m "Fix recipe viewing and extraction"
git push origin main
```

## Remaining limitation

A static GitHub Pages app cannot guarantee access to every recipe URL: source sites and public CORS proxies may block requests. A personal OpenAI API key does not download a page or bypass CORS. The updated modal therefore provides a paste-text fallback; when text can be obtained, the user's own key can be used to parse it.
