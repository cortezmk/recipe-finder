import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, ValidationErrors, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { RecipeService } from '../../services/recipe.service';
import { TagListComponent } from '../UI/tag-list/tag-list.component';
import { FormComponent } from '../../guards/unsaved-changes.guard';

@Component({
  selector: 'app-recipe-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDividerModule,
    TagListComponent
  ],
  templateUrl: './recipe-create.component.html',
  styleUrls: ['./recipe-create.component.scss']
})
export class RecipeCreateComponent implements FormComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);

  form!: FormGroup;
  submitting = signal(false);
  tags = signal<string[]>([]);
  allTags = computed(() => this.recipeService.getAllTags());
  
  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      ingredients: this.fb.array([this.fb.control('', Validators.required)]),
      tags: [[], this.maxTagsValidator(5)],
      steps: this.fb.array([this.fb.control('', Validators.required)])
    });
  }

  get ingredients(): FormArray {
    return this.form.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.form.get('steps') as FormArray;
  }

  addIngredient(): void {
    this.ingredients.push(this.fb.control('', Validators.required));
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  addStep(): void {
    this.steps.push(this.fb.control('', Validators.required));
  }

  removeStep(index: number): void {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.submitting.set(true);
      const formValue = this.form.value;
      const tags = this.form.get('tags')?.value || [];
      const recipe = {
        name: formValue.name,
        description: formValue.description,
        tags: tags,
        ingredients: formValue.ingredients,
        steps: formValue.steps
      };
      try {
        const newRecipe = this.recipeService.addRecipe(recipe);
        this.router.navigate(['/recipes', newRecipe.id]);
      } catch (error) {
        console.error('Error creating recipe:', error);
        alert('Error creating recipe. Please try again.');
      } finally {
        this.submitting.set(false);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/recipes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach(c => c.markAsTouched());
      } else if (control) {
        control.markAsTouched();
      }
    });
  }

  maxTagsValidator(maxTags: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const tags = control.value;
      if (!tags || !Array.isArray(tags)) {
        return null;
      }
      if (tags.length > maxTags) {
        return { maxTags: { max: maxTags, actual: tags.length } };
      }
      return null;
    };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  isArrayFieldInvalid(arrayName: string, index: number): boolean {
    const array = this.form.get(arrayName) as FormArray;
    const control = array.at(index);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getArrayFieldError(arrayName: string, index: number): string {
    const array = this.form.get(arrayName) as FormArray;
    const control = array.at(index);
    if (control && control.errors) {
      if (control.errors['required']) return 'This field is required';
    }
    return '';
  }
}
