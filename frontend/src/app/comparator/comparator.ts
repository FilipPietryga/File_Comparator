import { CommonModule, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'comparator',
  templateUrl: './comparator.html',
  styleUrls: ['./comparator.scss'],
  imports: [CommonModule, NgClass, FormsModule],
  standalone: true,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Comparator {
  appTitle = 'Automated File Comparator';

  originalContent = signal<string | null>(null);
  changedContent = signal<string | null>(null);

  ignoreWhitespace = signal<boolean>(true); 

  private normalizedComparisonResult = computed<string>(() => {
    const original = this.originalContent();
    const changed = this.changedContent();
    const ignore = this.ignoreWhitespace();

    if (original === null || changed === null) {
      return '';
    }

    const normalizedOriginal = ignore ? this.normalizeContent(original) : original;
    const normalizedChanged = ignore ? this.normalizeContent(changed) : changed;

    if (normalizedOriginal === normalizedChanged) {
      return 'Files are IDENTICAL.';
    } else {
      return 'Files are DIFFERENT.';
    }
  });

  comparisonResult = this.normalizedComparisonResult;

  comparisonStyle = computed(() => {
    const result = this.comparisonResult();
    if (result === 'Files are IDENTICAL.') {
      return 'match';
    } else if (result === 'Files are DIFFERENT.') {
      return 'mismatch';
    }
    return ''; 
  });

  private normalizeContent(content: string): string {
    let cleaned = content
      .replace(/[\r\n]+/g, ' ') 
      .replace(/[\t\f\v]+/g, ' '); 

    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned.trim();
  }

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

  lineComparison = computed<{ lineA: string, lineB: string, status: 'EQUAL' | 'A_ONLY' | 'B_ONLY' }[]>(() => {
    const original = this.originalContent();
    const changed = this.changedContent();
    const ignore = this.ignoreWhitespace();

    if (!original || !changed) {
      return [];
    }

    const linesA = original.split(/\r?\n/);
    const linesB = changed.split(/\r?\n/);

    const result: { lineA: string, lineB: string, status: 'EQUAL' | 'A_ONLY' | 'B_ONLY' }[] = [];
    
    const maxLength = Math.max(linesA.length, linesB.length);

    for (let i = 0; i < maxLength; i++) {
      const lineA = linesA[i] !== undefined ? linesA[i] : '';
      const lineB = linesB[i] !== undefined ? linesB[i] : '';
      
      const compareA = ignore ? this.normalizeLine(lineA) : lineA;
      const compareB = ignore ? this.normalizeLine(lineB) : lineB;

      let status: 'EQUAL' | 'A_ONLY' | 'B_ONLY';
      
      if (compareA === compareB) {
        status = 'EQUAL';
      } else if (lineA && !lineB) {
        status = 'A_ONLY'; 
      } else if (!lineA && lineB) {
        status = 'B_ONLY'; 
      } else {
        status = 'A_ONLY'; 
      }

      if (status === 'EQUAL') {
        result.push({ lineA, lineB, status: 'EQUAL' });
      } else {
        if (lineA) {
          result.push({ lineA, lineB: '', status: 'A_ONLY' });
        }
        if (lineB) {
          result.push({ lineA: '', lineB, status: 'B_ONLY' });
        }
      }
    }
    
    return result;
  });


  private normalizeLine(line: string): string {
    return line.replace(/\s+/g, ' ').trim();
  }
}