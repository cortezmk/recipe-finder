import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { Recipe } from '../../models/recipe.model';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);

  recipe = signal<Recipe | null>(null);
  loading = signal(true);

  constructor() {
    this.route.data.subscribe(data => {
      this.recipe.set(data['recipe']);
      this.loading.set(false);
    });
  }

  onBackToList(): void {
    this.router.navigate(['/recipes']);
  }

  onDeleteRecipe(): void {
    if (this.recipe() && confirm('Are you sure you want to delete this recipe?')) {
      this.recipeService.deleteRecipe(this.recipe()!.id);
      this.router.navigate(['/recipes']);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
