# Recipe Finder (List + Detail + Create)

## Goal

Build a small Angular app to browse, search, and create recipes. Data can be stored in memory or localStorage (no backend required).

---

## User Stories

1. **Browse:** As a user, I can see a paginated list of recipes with name, short description, and tags.
2. **Search/Filter:** I can filter recipes by a free-text search (name or description) and by selecting one or more tags.
3. **View details:** I can click a recipe to see a detail page with full description, ingredients, and steps.
4. **Create:** I can add a new recipe via a form with validation.
5. **Persis:** My recipes persist across reloads.

---

## Requirements

### Routing

- `/recipes` – list view (supports query params for search, selected tags, and page).
- `/recipes/:id` – detail view (use a Route Resolver to fetch the recipe).
- `/recipes/new` – create form (protect with a simple CanDeactivate guard to warn on unsaved changes).

### State & Data

- A `RecipeService` manages data (local storage).
- **Recipe model:**
  ```typescript
  export interface Recipe {
    id: string;
    name: string;
    description: string;
    tags: string[];        // e.g. ["vegan","quick","dessert"]
    ingredients: string[]; // simple strings is fine
    steps: string[];       // ordered steps
    createdAt: string;     // ISO string
  }
  ```

### List View

- Shows recipes, basic pagination (page size 10).
- Search box (debounced) + tag multiselect (chips or checkboxes).
- Reflect filters & page in the URL query params; loading the URL restores state.

### Detail View

- Display all fields neatly.
- If recipe not found, navigate to `/recipes`

### Create Form

- Reactive Forms with validation:
  - `name`: required, min length 3
  - `description`: required
  - `tags`: 0..5 tags (custom validator)
  - `ingredients`: at least 1
  - `steps`: at least 1
- Add/remove ingredients and steps dynamically (`FormArray`).
- On save, create an `id`, `createdAt`, and navigate to the detail page.
- CanDeactivate guard: if the form is dirty, confirm before leaving.

### UX & Reusability

- A custom pipe `highlight` that wraps matched search terms in `<mark>` in the list view.
- Basic, clean styling

---
