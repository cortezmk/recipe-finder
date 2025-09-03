import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RecipeService } from '../services/recipe.service';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeResolver implements Resolve<Recipe | null> {
  constructor(
    private recipeService: RecipeService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Recipe | null {
    const id = route.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/recipes']);
      return null;
    }

    const recipe = this.recipeService.getRecipeById(id);
    if (!recipe) {
      this.router.navigate(['/recipes']);
      return null;
    }

    return recipe;
  }
}
