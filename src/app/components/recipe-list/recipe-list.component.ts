import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipListboxChange } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import { TagListComponent } from '../UI/tag-list/tag-list.component';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    HighlightPipe,
    TagListComponent
  ],
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);

  tags = signal<string[]>([]);

  searchQuery = signal('');
  selectedTags = signal<string[]>([]);
  currentPage = signal(0);
  pageSize = 10;

  recipes = this.recipeService.getAllRecipes();
  allTags = computed(() => this.recipeService.getAllTags());

  filteredRecipes = computed(() => {
    const recipes = this.recipeService.searchRecipes(
      this.searchQuery(),
      this.selectedTags()
    );
    return recipes;
  });

  paginatedRecipes = computed(() => {
    const startIndex = this.currentPage() * this.pageSize;
    const recipes = this.filteredRecipes().slice(startIndex, startIndex + this.pageSize);
    console.log('Paginated recipes:', { startIndex, pageSize: this.pageSize, total: this.filteredRecipes().length, result: recipes.length });
    return recipes;
  });

  totalRecipes = computed(() => this.filteredRecipes().length);

  private searchSubject = new Subject<string>();

  constructor() {
    effect(() => {
      console.log('Effect triggered:', { tags: this.tags(), selectedTags: this.selectedTags() });
      this.selectedTags.set(this.tags() || []);
      this.updateUrl();
    });
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.searchQuery.set(query);
        this.currentPage.set(0);
        this.updateUrl();
      });
    this.loadStateFromUrl();
  }

  onSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  onPageChange(event: PageEvent): void {
    console.log('Page changed:', event);
    this.currentPage.set(event.pageIndex);
    this.updateUrl();
  }

  onRecipeClick(recipe: Recipe): void {
    this.router.navigate(['/recipes', recipe.id]);
  }

  onNewRecipe(): void {
    this.router.navigate(['/recipes/new']);
  }

  private loadStateFromUrl(): void {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery.set(params['search']);
      }
      if (params['tags']) {
        const tags = Array.isArray(params['tags']) ? params['tags'] : [params['tags']];
        this.selectedTags.set(tags);
      }
      if (params['page']) {
        const page = parseInt(params['page']);
        this.currentPage.set(isNaN(page) ? 0 : page);
      } else {
        this.currentPage.set(0);
      }
    });
  }

  private updateUrl(): void {
    const queryParams: any = {};
    
    if (this.searchQuery() || queryParams.search !== '') {
      queryParams.search = this.searchQuery();
    }
    if (this.selectedTags().length > 0) {
      queryParams.tags = this.selectedTags();
    }
    if (this.currentPage() >= 0) {
      queryParams.page = this.currentPage();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
