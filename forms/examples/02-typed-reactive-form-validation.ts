/**
 * 02-typed-reactive-form-validation.ts
 * ============================================================================
 * Production Pattern: Strictly Typed Reactive Forms with NonNullableFormBuilder
 *
 * Real-World Scenario:
 * - Enterprise Checkout Payment Form.
 * - Non-nullable types prevent null/undefined runtime crashes upon form.reset().
 * - Synchronous validators with regex pattern matching.
 * - takeUntilDestroyed() prevents memory leaks on control streams.
 * ============================================================================
 */

import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Explicit Form Contract Interface
export interface PaymentFormModel {
  cardholderName: FormControl<string>;
  cardNumber: FormControl<string>;
  expirationMonth: FormControl<string>;
  expirationYear: FormControl<string>;
  cvv: FormControl<string>;
  billingZip: FormControl<string>;
  saveForFuture: FormControl<boolean>;
}

@Component({
  selector: 'app-typed-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="checkout-card">
      <header class="checkout-header">
        <h3>Secure Enterprise Checkout</h3>
        <span class="security-badge">🔒 256-Bit SSL Encrypted</span>
      </header>

      <form [formGroup]="paymentForm" (ngSubmit)="processPayment()" novalidate>
        
        <!-- Cardholder Name -->
        <div class="field-row">
          <label for="cardholder">Cardholder Full Name</label>
          <input
            id="cardholder"
            type="text"
            formControlName="cardholderName"
            placeholder="Jane Doe"
            class="input-field"
            [class.invalid]="isInvalid('cardholderName')"
          />
          @if (isInvalid('cardholderName')) {
            <span class="field-error">Cardholder name is required.</span>
          }
        </div>

        <!-- 16-Digit Card Number -->
        <div class="field-row">
          <label for="cardNumber">Credit Card Number</label>
          <input
            id="cardNumber"
            type="text"
            formControlName="cardNumber"
            placeholder="4111 2222 3333 4444"
            maxlength="19"
            class="input-field"
            [class.invalid]="isInvalid('cardNumber')"
          />
          @if (isInvalid('cardNumber')) {
            <span class="field-error">
              @if (paymentForm.controls.cardNumber.errors?.['required']) {
                Card number is required.
              }
              @if (paymentForm.controls.cardNumber.errors?.['pattern']) {
                Must be 16 digits (spaces optional).
              }
            </span>
          }
        </div>

        <!-- Expiration & Security CVV Grid -->
        <div class="field-grid-three">
          <div>
            <label for="expMonth">MM</label>
            <input
              id="expMonth"
              type="text"
              formControlName="expirationMonth"
              placeholder="08"
              maxlength="2"
              class="input-field"
              [class.invalid]="isInvalid('expirationMonth')"
            />
          </div>

          <div>
            <label for="expYear">YY</label>
            <input
              id="expYear"
              type="text"
              formControlName="expirationYear"
              placeholder="28"
              maxlength="2"
              class="input-field"
              [class.invalid]="isInvalid('expirationYear')"
            />
          </div>

          <div>
            <label for="cvv">CVV</label>
            <input
              id="cvv"
              type="password"
              formControlName="cvv"
              placeholder="123"
              maxlength="4"
              class="input-field"
              [class.invalid]="isInvalid('cvv')"
            />
          </div>
        </div>

        <!-- Billing Zip -->
        <div class="field-row">
          <label for="billingZip">Billing Postal Code</label>
          <input
            id="billingZip"
            type="text"
            formControlName="billingZip"
            placeholder="94105"
            class="input-field"
            [class.invalid]="isInvalid('billingZip')"
          />
        </div>

        <!-- Save Checkbox -->
        <div class="field-checkbox">
          <input id="saveCard" type="checkbox" formControlName="saveForFuture" />
          <label for="saveCard">Save payment method for future recurring billing</label>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn-checkout"
          [disabled]="paymentForm.invalid || isProcessing"
        >
          {{ isProcessing ? 'Authorizing Payment...' : 'Authorize $149.00' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .checkout-card { max-width: 520px; margin: 2rem auto; background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .checkout-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; }
    .security-badge { font-size: 0.75rem; color: #16a34a; font-weight: 600; background: #f0fdf4; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .field-row { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .field-grid-three { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
    .input-field { padding: 0.6rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
    .input-field.invalid { border-color: #ef4444; background: #fff5f5; }
    .field-error { color: #dc2626; font-size: 0.75rem; font-weight: 500; }
    .field-checkbox { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; font-size: 0.85rem; color: #475569; }
    .btn-checkout { width: 100%; padding: 0.85rem; background: #059669; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
    .btn-checkout:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class TypedPaymentFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  isProcessing = false;

  // Strictly typed form with initial non-nullable values
  readonly paymentForm: FormGroup<PaymentFormModel> = this.fb.group({
    cardholderName: ['', [Validators.required, Validators.minLength(3)]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]],
    expirationMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
    expirationYear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    billingZip: ['', [Validators.required, Validators.minLength(5)]],
    saveForFuture: [false]
  });

  constructor() {
    // Reactive stream listener with clean auto-unsubscription
    this.paymentForm.controls.cardNumber.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        // Auto format card number spacing if desired
        if (val.length === 4 || val.length === 9 || val.length === 14) {
          // Format logic can be placed here
        }
      });
  }

  isInvalid(controlName: keyof PaymentFormModel): boolean {
    const ctrl = this.paymentForm.controls[controlName];
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  processPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    // getRawValue() returns exact typed object without null unions
    const payload = this.paymentForm.getRawValue();
    this.isProcessing = true;

    console.log('Dispatching secure payment payload:', payload);

    setTimeout(() => {
      this.isProcessing = false;
      alert(`Authorization successful for card ending in ${payload.cardNumber.slice(-4)}`);
      this.paymentForm.reset();
    }, 1200);
  }
}

