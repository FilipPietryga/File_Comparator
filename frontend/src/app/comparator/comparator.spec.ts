import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Comparator } from './comparator';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';

describe('Comparator', () => {
  let component: Comparator;
  let fixture: ComponentFixture<Comparator>;

  function normalizeContent(content: string): string {
    return (component as any).normalizeContent(content);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Comparator, CommonModule, NgClass, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Comparator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Normalization Utilities', () => {
    it('should normalize content by replacing tabs, newlines, and consolidating spaces', () => {
      const input = "Line 1.\n\nLine 2.\t\tWith tabs.\r\n";
      const expected = "Line 1. Line 2. With tabs.";
      expect(normalizeContent(input)).toBe(expected);
    });

    it('should handle leading/trailing whitespace and multiple spaces correctly', () => {
      const input = "  start of line   and end  ";
      const expected = "start of line and end";
      expect(normalizeContent(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      expect(normalizeContent("")).toBe("");
    });
  });

  describe('Comparison Results', () => {
    beforeEach(() => {
      component.ignoreWhitespace.set(false); 
    });

    it('should report IDENTICAL when contents are strictly equal', () => {
      component.originalContent.set('a b c');
      component.changedContent.set('a b c');
      expect(component.comparisonResult()).toBe('Files are IDENTICAL.');
      expect(component.comparisonStyle()).toBe('match');
    });

    it('should report DIFFERENT when contents are not equal', () => {
      component.originalContent.set('a b c');
      component.changedContent.set('a b x');
      expect(component.comparisonResult()).toBe('Files are DIFFERENT.');
      expect(component.comparisonStyle()).toBe('mismatch');
    });

    it('should report IDENTICAL when contents are equal after normalization (ignoreWhitespace: true)', () => {
      component.originalContent.set('a\n\t\n b c');
      component.changedContent.set('a b   c');
      component.ignoreWhitespace.set(true);

      expect(component.comparisonResult()).toBe('Files are IDENTICAL.');
      expect(component.comparisonStyle()).toBe('match');
    });

    it('should report DIFFERENT when contents are different even after normalization', () => {
      component.originalContent.set('a b c');
      component.changedContent.set('a b c d');
      component.ignoreWhitespace.set(true);
      
      expect(component.comparisonResult()).toBe('Files are DIFFERENT.');
      expect(component.comparisonStyle()).toBe('mismatch');
    });

    it('should return empty style and result when content is missing', () => {
      component.originalContent.set(null);
      component.changedContent.set('content');
      expect(component.comparisonResult()).toBe('');
      expect(component.comparisonStyle()).toBe('');
    });
  });

  describe('Line Comparison', () => {
    it('should correctly mark equal lines', () => {
      const original = 'Line 1\nLine 2';
      const changed = 'Line 1\nLine 2';
      component.originalContent.set(original);
      component.changedContent.set(changed);

      const result = component.lineComparison();
      expect(result.length).toBe(2);
      expect(result[0].status).toBe('EQUAL');
      expect(result[1].status).toBe('EQUAL');
    });

    it('should correctly mark lines missing in B (A_ONLY)', () => {
      const original = 'Line 1\nLine 2 in A only';
      const changed = 'Line 1';
      component.originalContent.set(original);
      component.changedContent.set(changed);
      component.ignoreWhitespace.set(false);

      const result = component.lineComparison();
      expect(result.length).toBe(2);
      expect(result[0].status).toBe('EQUAL');
      expect(result[1]).toEqual({ lineA: 'Line 2 in A only', lineB: '', status: 'A_ONLY' });
    });

    it('should correctly mark lines missing in A (B_ONLY)', () => {
      const original = 'Line 1';
      const changed = 'Line 1\nLine 2 in B only';
      component.originalContent.set(original);
      component.changedContent.set(changed);
      component.ignoreWhitespace.set(false);

      const result = component.lineComparison();
      expect(result.length).toBe(2);
      expect(result[0].status).toBe('EQUAL');
      expect(result[1]).toEqual({ lineA: '', lineB: 'Line 2 in B only', status: 'B_ONLY' });
    });
    
    it('should treat lines as EQUAL when ignoring whitespace, even if the content is line-shifted', () => {
      component.ignoreWhitespace.set(true);
      const original = '  Function a() ';
      const changed = 'Function a()';
      component.originalContent.set(original);
      component.changedContent.set(changed);

      const result = component.lineComparison();
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('EQUAL');
      expect(result[0].lineA).toBe(original); 
      expect(result[0].lineB).toBe(changed);
    });

    it('should mark different lines that both exist as A_ONLY and B_ONLY (diff logic)', () => {
      component.ignoreWhitespace.set(false);
      const original = 'Line one\nLine two';
      const changed = 'Line one\nLine three';
      component.originalContent.set(original);
      component.changedContent.set(changed);

      const result = component.lineComparison();
      expect(result.length).toBe(3); 
      expect(result[0].status).toBe('EQUAL');
      
      expect(result[1]).toEqual({ lineA: 'Line two', lineB: '', status: 'A_ONLY' });
      
      expect(result[2]).toEqual({ lineA: '', lineB: 'Line three', status: 'B_ONLY' });
    });
  });

  describe('File Selection', () => {
    it('should update originalContent signal after file reading', () => {
      const mockFile = new File(['Test content for A'], 'fileA.txt', { type: 'text/plain' });
      const mockReader = {
        readAsText: (file: File) => {
          if (mockReader.onload) {
            mockReader.onload({ target: { result: 'Test content for A' } } as any);
          }
        },
        onload: null as any,
      };
      
      spyOn(window as any, 'FileReader').and.returnValue(mockReader);

      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as unknown as Event;

      component.onFileSelected(mockEvent, 'original');

      expect(component.originalContent()).toBe('Test content for A');
      
      component.changedContent.set('Test content for A'); 
      expect(component.comparisonResult()).toBe('Files are IDENTICAL.');
    });
  });
});