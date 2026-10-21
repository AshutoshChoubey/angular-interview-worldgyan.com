/**
 * 07-reactive-forms-to-signals-interop.ts
 * ============================================================================
 * Production Pattern: Reactive Forms to Signals Interop Bridge
 *
 * Real-World Scenario:
 * - Enterprise Order Configuration with Live Price Calculator & Discount Tier.
 * - Bridges form.valueChanges / form.statusChanges into Angular Signals via toSignal().
 * - Derives computed signals for instant UI updates with zero template function calls.
 * - Preserves existing Reactive Forms validation while unlocking O(1) Signal reactivity.
 * ============================================================================
 */

import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-form-signals-bridge',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bridge-card">
      <header>
        <h3>SaaS Subscription Tier Calculator</h3>
        <p class="subtitle">Reactive Form state bridged seamlessly into Angular Signals.</p>
      </header>

      <form [formGroup]="configForm">
        <!-- Seats Slider -->
        <div class="control-row">
          <label>Team Seats: <strong>{{ formValues().seats }}</strong></label>
          <input
            type="range"
            formControlName="seats"
            min="1"
            max="100"
            class="range-slider"
          />
        </div>

        <!-- Billing Frequency -->
        <div class="control-row">
          <label>Billing Frequency</label>
          <div class="radio-group">
            <label>
              <input type="radio" value="monthly" formControlName="billingCycle" />
              Monthly
            </label>
            <label>
              <input type="radio" value="annual" formControlName="billingCycle" />
              Annual (20% Off)
            </label>
          </div>
        </div>

        <!-- Add-on Toggles -->
        <div class="control-row-checkbox">
          <input type="checkbox" id="aiSupport" formControlName="dedicatedAiAgent" />
          <label for="aiSupport">Include 24/7 Dedicated Autonomous AI Agent (+\$99/mo)</label>
        </div>
      </form>

      <!-- Pure Computed Signals Visualizer (No zone re-renders) -->
      <div class="pricing-matrix">
        <div class="matrix-item">
          <span>Base Rate:</span>
          <strong>\${{ basePrice() }}/seat</strong>
        </div>
        <div class="matrix-item">
          <span>Volume Discount:</span>
          <span class="discount-pill">{{ discountPercent() }}%</span>
        </div>
        <div class="matrix-item">
          <span>Form Validity Signal:</span>
          <span [class.valid-tag]="isFormValid()" [class.invalid-tag]="!isFormValid()">
            {{ isFormValid() ? 'VALID' : 'INVALID' }}
          </span>
        </div>
        <hr />
        <div class="matrix-total">
          <span>Estimated Total:</span>
          <strong class="total-price">\${{ totalPrice() | number:'1.2-2' }}/mo</strong>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bridge-card { max-width: 500px; margin: 2rem auto; font-family: system-ui, sans-serif; background: #fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; }
    .subtitle { color: #64748b; font-size: 0.85rem; margin-top: -0.4rem; margin-bottom: 1.5rem; }
    .control-row { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .control-row-checkbox { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; font-size: 0.88rem; }
    .range-slider { width: 100%; }
    .radio-group { display: flex; gap: 1.5rem; font-size: 0.9rem; }
    .pricing-matrix { background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 1rem; }
    .matrix-item { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
    .discount-pill { background: #dcfce7; color: #15803d; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem; }
    .valid-tag { color: #16a34a; font-weight: bold; }
    .invalid-tag { color: #dc2626; font-weight: bold; }
    .matrix-total { display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; font-size: 1.1rem; }
    .total-price { color: #2563eb; font-size: 1.4rem; }
  `]
})
export class FormSignalsBridgeComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  // 1. Standard Reactive Form Definition
  readonly configForm = this.fb.group({
    seats: [5, [Validators.required, Validators.min(1), Validators.max(100)]],
    billingCycle: ['annual', [Validators.required]],
    dedicatedAiAgent: [true]
  });

  // 2. Bridge valueChanges into a synchronous Signal with initial snapshot
  readonly formValues = toSignal(this.configForm.valueChanges, {
    initialValue: this.configForm.getRawValue()
  });

  // 3. Bridge statusChanges into a boolean Signal
  readonly isFormValid = toSignal(
    this.configForm.statusChanges,
    { initialValue: this.configForm.status === 'VALID' }
  );

  // 4. Derive Computed Values Reactively ($O(1)$ computation)
  readonly basePrice = computed(() => {
    const seats = this.formValues().seats ?? 1;
    return seats > 50 ? 25 : seats > 20 ? 30 : 35;
  });

  readonly discountPercent = computed(() => {
    const cycle = this.formValues().billingCycle;
    const seats = this.formValues().seats ?? 1;
    let discount = cycle === 'annual' ? 20 : 0;
    if (seats >= 25) discount += 10;
    return discount;
  });

  readonly totalPrice = computed(() => {
    const vals = this.formValues();
    const seats = vals.seats ?? 1;
    const base = this.basePrice();
    const discount = (100 - this.discountPercent()) / 100;
    const aiFee = vals.dedicatedAiAgent ? 99 : 0;

    return (seats * base * discount) + aiFee;
  });
}
