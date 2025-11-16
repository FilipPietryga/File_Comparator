import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms'; 

interface LineDiff {
  lineA: string;
  lineB: string;
  status: 'EQUAL' | 'A_ONLY' | 'B_ONLY' | 'MODIFIED';
  lineNumA: number | null;
  lineNumB: number | null;
}

@Component({
  selector: 'comparator',
  templateUrl: './comparator.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrl: './comparator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class Comparator {
  appTitle = 'Automated File Comparator';

  originalContent = signal<string | null>(''); 
  changedContent = signal<string | null>(''); 
  
  private readonly MAX_SEARCH = 5; 

  private prepareContent(content: string): string {
    return content ? content.replace(/\r/g, '') : '';
  }
  
  private directComparisonResult = computed<string>(() => {
    const original = this.prepareContent(this.originalContent() || '');
    const changed = this.prepareContent(this.changedContent() || '');

    if (!original.trim() && !changed.trim()) {
      return '';
    }

    if (original === changed) {
      return 'Files are IDENTICAL.';
    } else {
      return 'Files are DIFFERENT.';
    }
  });

  comparisonResult = this.directComparisonResult;

  comparisonStyle = computed(() => {
    const result = this.comparisonResult();
    if (result === 'Files are IDENTICAL.') {
      return 'match';
    } else if (result === 'Files are DIFFERENT.') {
      return 'mismatch';
    }
    return ''; 
  });

  lineComparison = computed<LineDiff[]>(() => {
    const original = this.originalContent() || '';
    const changed = this.changedContent() || '';

    if (!original.trim() && !changed.trim()) {
        return [];
    }
    
    const linesA = original.split(/\r?\n/);
    const linesB = changed.split(/\r?\n/);

    const diffs: LineDiff[] = [];
    let indexA = 0;
    let indexB = 0;
    let lineNumA = 1;
    let lineNumB = 1;

    while (indexA < linesA.length || indexB < linesB.length) {
        const lineA = linesA[indexA] !== undefined ? linesA[indexA] : '';
        const lineB = linesB[indexB] !== undefined ? linesB[indexB] : '';
        
        if (lineA === lineB && (lineA || lineB)) {
            diffs.push({ lineA, lineB, status: 'EQUAL', lineNumA: lineNumA++, lineNumB: lineNumB++ });
            indexA++;
            indexB++;
            continue;
        }

        let matched = false;

        if (indexA < linesA.length) {
            let k = indexB;
            while (k < linesB.length && k < indexB + this.MAX_SEARCH) {
                if (lineA === linesB[k]) {
                    for (let l = indexB; l < k; l++) {
                        diffs.push({ lineA: '', lineB: linesB[l], status: 'B_ONLY', lineNumA: null, lineNumB: lineNumB++ });
                    }
                    indexB = k;
                    matched = true;
                    diffs.push({ lineA, lineB: linesB[indexB], status: 'EQUAL', lineNumA: lineNumA++, lineNumB: lineNumB++ });
                    indexA++; indexB++;
                    break;
                }
                k++;
            }
        }
        
        if (!matched && indexB < linesB.length) {
            let l = indexA;
            while (l < linesA.length && l < indexA + this.MAX_SEARCH) {
                if (lineB === linesA[l]) {
                    for (let m = indexA; m < l; m++) {
                        diffs.push({ lineA: linesA[m], lineB: '', status: 'A_ONLY', lineNumA: lineNumA++, lineNumB: null });
                    }
                    indexA = l;
                    matched = true;
                    diffs.push({ lineA: linesA[indexA], lineB, status: 'EQUAL', lineNumA: lineNumA++, lineNumB: lineNumB++ });
                    indexA++; indexB++;
                    break;
                }
                l++;
            }
        }

        if (!matched) {
            if (indexA < linesA.length && indexB < linesB.length) {
                diffs.push({ lineA, lineB, status: 'MODIFIED', lineNumA: lineNumA++, lineNumB: lineNumB++ });
                indexA++;
                indexB++;
            } else if (indexA < linesA.length) {
                diffs.push({ lineA, lineB: '', status: 'A_ONLY', lineNumA: lineNumA++, lineNumB: null });
                indexA++;
            } else if (indexB < linesB.length) {
                diffs.push({ lineA: '', lineB, status: 'B_ONLY', lineNumA: null, lineNumB: lineNumB++ });
                indexB++;
            } else {
                break;
            }
        }
    }

    return diffs;
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