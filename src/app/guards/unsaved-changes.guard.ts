import { FormGroup } from "@angular/forms";
import { CanDeactivateFn } from "@angular/router";

export interface FormComponent {
  form: FormGroup;
}

export const unsavedChangesGuard: CanDeactivateFn<FormComponent> = (component: FormComponent) => {
  if (component.form.dirty && !component.form.valid) {
    return confirm('You have unsaved changes. Are you sure you want to leave?');
  }
  return true;
};