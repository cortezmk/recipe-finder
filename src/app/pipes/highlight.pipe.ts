import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string, searchTerm: string): SafeHtml {
    if (!searchTerm || !text) {
      return text;
    }

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const highlightedText = text.replace(regex, `<mark>${searchTerm}</mark>`);
    
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }
}
