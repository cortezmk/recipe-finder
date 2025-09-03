import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly STORAGE_KEY = 'recipes';
  private recipes = signal<Recipe[]>([]);

  constructor(private http: HttpClient) {
    this.loadFromStorage();
    this.initializeSampleData();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const recipes = JSON.parse(stored);
        this.recipes.set(recipes);
      } catch (error) {
        console.error('Error loading recipes from storage:', error);
        this.recipes.set([]);
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.recipes()));
  }

  private initializeSampleData(): void {
    if (this.recipes().length === 0) {
      this.http.get<Recipe[]>('assets/sample-recipes.json').subscribe({
        next: (sampleRecipes) => {
          this.recipes.set(sampleRecipes);
          this.saveToStorage();
        },
        error: (error) => {
          console.error('Error loading sample recipes:', error);
        }
      });
    }
  }

  getAllRecipes() {
    return this.recipes.asReadonly();
  }

  getRecipeById(id: string): Recipe | undefined {
    return this.recipes().find(recipe => recipe.id === id);
  }

  addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Recipe {
    const newRecipe: Recipe = {
      ...recipe,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    this.recipes.update(recipes => [...recipes, newRecipe]);
    this.saveToStorage();
    return newRecipe;
  }

  updateRecipe(id: string, updates: Partial<Recipe>): Recipe | undefined {
    const index = this.recipes().findIndex(recipe => recipe.id === id);
    if (index === -1) return undefined;

    const updatedRecipe = { ...this.recipes()[index], ...updates };
    this.recipes.update(recipes => 
      recipes.map(recipe => recipe.id === id ? updatedRecipe : recipe)
    );
    this.saveToStorage();
    return updatedRecipe;
  }

  deleteRecipe(id: string): boolean {
    const index = this.recipes().findIndex(recipe => recipe.id === id);
    if (index === -1) return false;

    this.recipes.update(recipes => recipes.filter(recipe => recipe.id !== id));
    this.saveToStorage();
    return true;
  }

  searchRecipes(query: string, selectedTags: string[] = []): Recipe[] {
    const recipes = this.recipes();
    
    return recipes.filter(recipe => {
      const matchesQuery = !query || 
        recipe.name.toLowerCase().includes(query.toLowerCase()) ||
        recipe.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => recipe.tags.includes(tag));
      
      return matchesQuery && matchesTags;
    });
  }

  getAllTags(): string[] {
    const allTags = this.recipes().flatMap(recipe => recipe.tags);
    return [...new Set(allTags)].sort();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
