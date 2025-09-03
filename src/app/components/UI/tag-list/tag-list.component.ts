import {LiveAnnouncer} from '@angular/cdk/a11y';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ChangeDetectionStrategy, Component, computed, forwardRef, HostBinding, inject, input, model, signal} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'tag-list',
  standalone: true,
  imports: [MatFormFieldModule, MatChipsModule, MatIconModule, MatAutocompleteModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagListComponent),
      multi: true
    }
  ]
})
export class TagListComponent implements ControlValueAccessor {
  label = input('');
  tags = model<string[]>([]);
  autocomplete = input<string[]>([]);
  readonly announcer = inject(LiveAnnouncer);
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly currentTag = model('');
  readonly filteredTags = computed(() => {
    const currentTag = this.currentTag().toLowerCase();
    return currentTag
      ? this.autocomplete().filter(tag => tag.toLowerCase().includes(currentTag) && !this.tags().includes(tag))
      : this.autocomplete().filter(tag => !this.tags().includes(tag));
  });

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.update(tags => [...tags, value]);
      this.onChange(this.tags());
      this.onTouched();
    }
    this.currentTag.set('');
  }

  remove(tag: string): void {
    this.tags.update(tags => {
      const index = tags.indexOf(tag);
      if (index < 0) {
        return tags;
      }
      tags.splice(index, 1);
      this.announcer.announce(`Removed ${tag}`);
      return [...tags];
    });
    this.onChange(this.tags());
    this.onTouched();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.update(tags => [...tags, event.option.viewValue]);
    this.currentTag.set('');
    event.option.deselect();
    this.onChange(this.tags());
    this.onTouched();
  }

  private onChange = (value: string[]) => {};
  private onTouched = () => {};

  writeValue(value: string[]): void {
    if (value) {
      this.tags.set(value);
    }
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
