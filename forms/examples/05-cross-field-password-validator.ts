/**
 * 05-cross-field-password-validator.ts
 * ============================================================================
 * Production Pattern: Group-Level Cross-Field Synchronous Validator
 *
 * Real-World Scenario:
 * - Enterprise Security Credentials Reset: Password & Password Confirmation.
 * - Comparing two distinct controls synchronously at the FormGroup level.
 * - Granular control error assignment and automatic cleanup.
 * ============================================================================
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

/**
 * Cross-field validator ensuring password and confirmPassword match exactly.
 * Attaches directly to the parent FormGroup validators array.
 */
export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null; // Let individual 'required' validators trigger first
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-password-reset-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="security-card">
      <h3>Update Security Credentials</h3>
      <p class="subtitle">Set a high-entropy password for your enterprise profile.</p>

      <form [formGroup]="resetForm" (ngSubmit)="updateCredentials()">
        
        <!-- New Password -->
        <div class="field-group">
          <label for="newPass">New Password</label>
          <input
            id="newPass"
            type="password"
            formControlName="newPassword"
            class="input-box"
            placeholder="Min 8 chars, 1 number, 1 special"
          />
          @if (newPasswordCtrl.invalid && newPasswordCtrl.touched) {
            <span class="error-msg">Password must be at least 8 characters long.</span>
          }
        </div>

        <!-- Confirm Password -->
        <div class="field-group">
          <label for="confirmPass">Confirm New Password</label>
          <input
            id="confirmPass"
            type="password"
            formControlName="confirmPassword"
            class="input-box"
            placeholder="Re-enter password"
          />
        </div>

        <!-- Cross-Field Error Notification -->
        @if (resetForm.errors?.['passwordMismatch'] && (confirmPasswordCtrl.dirty || confirmPasswordCtrl.touched)) {
          <div class="alert-box error" role="alert">
            <span>⚠️ Passwords do not match. Please verify your entries.</span>
          </div>
        }

        <button
          type="submit"
          class="btn-save"
          [disabled]="resetForm.invalid || isSubmitting"
        >
          {{ isSubmitting ? 'Updating...' : 'Update Password' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .security-card { max-width: 420px; margin: 2rem auto; font-family: system-ui, sans-serif; background: #fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; }
    .subtitle { color: #64748b; font-size: 0.85rem; margin-top: -0.5rem; margin-bottom: 1.25rem; }
    .field-group { margin-bottom: 1.1rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .input-box { padding: 0.65rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
    .error-msg { color: #ef4444; font-size: 0.78rem; }
    .alert-box { padding: 0.65rem 0.85rem; border-radius: 6px; font-size: 0.82rem; margin-bottom: 1.25rem; }
    .alert-box.error { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; }
    .btn-save { width: 100%; padding: 0.75rem; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class CrossFieldPasswordValidatorComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  isSubmitting = false;

  readonly resetForm: FormGroup = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    {
      // Attach group-level validator
      validators: [passwordMatchValidator]
    }
  );

  get newPasswordCtrl(): AbstractControl {
    return this.resetForm.get('newPassword')!;
  }

  get confirmPasswordCtrl(): AbstractControl {
    return this.resetForm.get('confirmPassword')!;
  }

  updateCredentials(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    console.log('Credentials updated securely:', this.resetForm.value);

    setTimeout(() => {
      this.isSubmitting = false;
      alert('Password updated successfully!');
      this.resetForm.reset();
    }, 900);
  }
}

