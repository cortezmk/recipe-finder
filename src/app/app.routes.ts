import { Routes } from '@angular/router';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { RecipeCreateComponent } from './components/recipe-create/recipe-create.component';
import { RecipeResolver } from './resolvers/recipe.resolver';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/recipes', pathMatch: 'full' },
  { path: 'recipes', component: RecipeListComponent },
  { 
    path: 'recipes/new', 
    component: RecipeCreateComponent,
    canDeactivate: [unsavedChangesGuard]
  },
  { 
    path: 'recipes/:id', 
    component: RecipeDetailComponent,
    resolve: { recipe: RecipeResolver }
  },
  { path: '**', redirectTo: '/recipes' }
];
