import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'comparator',
  templateUrl: './comparator.html',
  styleUrls: ['./comparator.scss'],
  imports: [CommonModule],
  standalone: true
})
export class Comparator {
  // Application header/title property
  appTitle = 'Automated File Comparator';

  // Signals to hold file contents
  originalContent = signal<string | null>(null);
  changedContent = signal<string | null>(null);

  // Computed signal for the comparison logic
  comparisonResult = computed<string>(() => {
    const original = this.originalContent();
    const changed = this.changedContent();

    if (original === null || changed === null) {
      return '';
    }

    if (original === changed) {
      return 'Files are IDENTICAL.';
    } else {
      return 'Files are DIFFERENT.';
    }
  });

  // Computed signal for dynamic styling
  comparisonStyle = computed(() => {
    const result = this.comparisonResult();
    if (result === 'Files are IDENTICAL.') {
      return 'match';
    } else if (result === 'Files are DIFFERENT.') {
      return 'mismatch';
    }
    return '';
  });


  onFileSelected(event: Event, type: 'original' | 'changed'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.readFile(file, type);
    }
  }

  private readFile(file: File, type: 'original' | 'changed'): void {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string; 
      
      if (type === 'original') {
        this.originalContent.set(content);
      } else {
        this.changedContent.set(content);
      }
    };

    reader.readAsText(file);
  }
}
