/**
 * 06-control-value-accessor-custom-input.ts
 * ============================================================================
 * Production Pattern: Custom Form Control with ControlValueAccessor (CVA)
 *
 * Real-World Scenario:
 * - Enterprise Risk Assessment & Rating Selector (1-5 Star Score).
 * - Full implementation of the 4 CVA methods:
 *   1. writeValue(val) - Updates DOM when model changes from outside.
 *   2. registerOnChange(fn) - Informs Angular Form when user clicks/interacts.
 *   3. registerOnTouched(fn) - Marks control as touched on blur/interaction.
 *   4. setDisabledState(isDisabled) - Handles control.disable() dynamically.
 * - Architectural contrast with Angular 22 Signal `model()` input.
 * ============================================================================
 */

import { Component, forwardRef, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

// ============================================================================
// 1. Production ControlValueAccessor Component
// ============================================================================
@Component({
  selector: 'app-star-rating-control',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingControlComponent),
      multi: true
    }
  ],
  template: `
    <div class="star-rating-box" [class.disabled]="disabled">
      <div class="stars-track" role="radiogroup" [attr.aria-label]="label()">
        @for (star of stars; track star) {
          <button
            type="button"
            class="star-btn"
            [class.active]="star <= value"
            [disabled]="disabled"
            (click)="selectRating(star)"
            (blur)="onBlur()"
            [attr.aria-checked]="star === value"
            role="radio"
          >
            ★
          </button>
        }
      </div>
      <span class="rating-value-label">{{ value > 0 ? value + ' / 5' : 'Unrated' }}</span>
    </div>
  `,
  styles: [`
    .star-rating-box { display: inline-flex; align-items: center; gap: 0.75rem; }
    .star-rating-box.disabled { opacity: 0.5; pointer-events: none; }
    .stars-track { display: flex; gap: 0.25rem; }
    .star-btn { background: none; border: none; font-size: 1.5rem; color: #cbd5e1; cursor: pointer; padding: 0.1rem; line-height: 1; transition: transform 0.1s; }
    .star-btn:hover:not(:disabled) { transform: scale(1.15); color: #f59e0b; }
    .star-btn.active { color: #f59e0b; }
    .rating-value-label { font-size: 0.85rem; font-weight: 600; color: #64748b; }
  `]
})
export class StarRatingControlComponent implements ControlValueAccessor {
  readonly label = input<string>('Select Rating');
  readonly stars = [1, 2, 3, 4, 5];

  value = 0;
  disabled = false;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  // 1. Called by Forms API when model changes programmatically
  writeValue(value: number | null): void {
    this.value = value ?? 0;
  }

  // 2. Registers callback to notify Forms API when UI changes
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  // 3. Registers callback to notify Forms API when control is blurred/touched
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // 4. Called by Forms API when status changes to/from DISABLED
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  selectRating(score: number): void {
    if (this.disabled) return;
    this.value = score;
    this.onChange(this.value);
    this.onTouched();
  }

  onBlur(): void {
    this.onTouched();
  }
}

// ============================================================================
// 2. Modern Angular 22 Signal Alternative: Component with model()
// No CVA, no NG_VALUE_ACCESSOR provider boilerplate, pure two-way signal!
// ============================================================================
@Component({
  selector: 'app-modern-signal-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="signal-rating">
      <span class="label">Signal Model Input:</span>
      @for (star of [1, 2, 3, 4, 5]; track star) {
        <button
          type="button"
          class="star-btn"
          [class.active]="star <= rating()"
          (click)="rating.set(star)"
        >
          ★
        </button>
      }
      <span>Score: {{ rating() }}</span>
    </div>
  `,
  styles: [`
    .signal-rating { display: flex; align-items: center; gap: 0.5rem; font-family: system-ui; }
    .star-btn { background: none; border: none; font-size: 1.25rem; color: #cbd5e1; cursor: pointer; }
    .star-btn.active { color: #8b5cf6; }
  `]
})
export class ModernSignalRatingComponent {
  // Angular 17.2+ / Angular 22 native two-way signal input
  readonly rating = model<number>(3);
}

// ============================================================================
// 3. Consumer Component Hosting both CVA and Signal Model
// ============================================================================
@Component({
  selector: 'app-cva-demo-host',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StarRatingControlComponent,
    ModernSignalRatingComponent
  ],
  template: `
    <div class="demo-wrapper">
      <h3>Vendor Risk Assessment & Rating</h3>

      <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
        <div class="field">
          <label>Security & Compliance Score (CVA Control)</label>
          <!-- Custom CVA directly bound with formControlName -->
          <app-star-rating-control
            formControlName="riskScore"
            label="Security Rating"
          />
          @if (reviewForm.controls.riskScore.invalid && reviewForm.controls.riskScore.touched) {
            <span class="error">A minimum score of 1 star is required.</span>
          }
        </div>

        <button type="submit" class="btn" [disabled]="reviewForm.invalid">
          Submit Assessment
        </button>
      </form>

      <hr />

      <!-- Modern Signal Alternative -->
      <app-modern-signal-rating [(rating)]="parentSignalRating" />
      <p>Parent Signal Value: {{ parentSignalRating }}</p>
    </div>
  `,
  styles: [`
    .demo-wrapper { max-width: 480px; margin: 2rem auto; font-family: system-ui; padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 8px; }
    .field { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .error { color: #dc2626; font-size: 0.8rem; }
    .btn { background: #0284c7; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; }
    .btn:disabled { opacity: 0.5; }
  `]
})
export class CvaDemoHostComponent {
  readonly reviewForm = new FormGroup({
    riskScore: new FormControl<number>(0, {
      validators: [Validators.required, Validators.min(1)],
      nonNullable: true
    })
  });

  parentSignalRating = 4;

  submitReview(): void {
    console.log('Submitted review score:', this.reviewForm.value);
    alert(`Rating saved: ${this.reviewForm.controls.riskScore.value} stars`);
  }
}
