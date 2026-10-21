/**
 * 04-async-validator-unique-email.ts
 * ============================================================================
 * Production Pattern: Debounced Asynchronous Validator with SwitchMap Cancellation
 *
 * Real-World Scenario:
 * - Enterprise User Registration with Corporate Domain & Unique Email Check.
 * - Prevents HTTP spamming by debouncing user typing (400ms delay via timer).
 * - Cancels pending HTTP requests using switchMap when the user resumes typing.
 * - Displays asynchronous 'PENDING' spinner state in real-time.
 * ============================================================================
 */

import { Component, Injectable, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

// Simulated Backend API Service
@Injectable({ providedIn: 'root' })
export class UserAccountService {
  private readonly takenEmails = new Set([
    'admin@worldgyan.com',
    'lead@worldgyan.com',
    'architect@enterprise.org',
    'contact@company.com'
  ]);

  checkEmailAvailability(email: string): Observable<{ isTaken: boolean; reason?: string }> {
    // Simulate network delay of 350ms
    return timer(350).pipe(
      map(() => {
        const normalized = email.trim().toLowerCase();
        const isTaken = this.takenEmails.has(normalized);
        return {
          isTaken,
          reason: isTaken ? 'This corporate email is already registered.' : undefined
        };
      })
    );
  }
}

// Reusable Factory for Production Async Validator
export function uniqueEmailValidator(accountService: UserAccountService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = control.value;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return of(null);
    }

    // Debounce 400ms to avoid hammering backend per keystroke
    return timer(400).pipe(
      switchMap(() => accountService.checkEmailAvailability(email)),
      map((response) => (response.isTaken ? { emailTaken: { message: response.reason } } : null)),
      catchError(() => of(null)) // Fallback gracefully if API is offline
    );
  };
}

@Component({
  selector: 'app-async-email-validation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="registration-card">
      <h3>Corporate Account Onboarding</h3>

      <form [formGroup]="signupForm" (ngSubmit)="submit()">
        
        <div class="form-group">
          <label for="corporateEmail">Corporate Email Address</label>
          <div class="input-wrapper">
            <input
              id="corporateEmail"
              type="email"
              formControlName="email"
              placeholder="architect@worldgyan.com"
              class="form-input"
              [class.valid]="emailControl.valid && emailControl.dirty"
              [class.invalid]="emailControl.invalid && emailControl.touched"
            />

            <!-- Real-time Async Pending Indicator -->
            @if (emailControl.status === 'PENDING') {
              <span class="spinner-badge" aria-live="polite">Checking... ⏳</span>
            } @else if (emailControl.valid && emailControl.dirty) {
              <span class="success-badge">✓ Available</span>
            }
          </div>

          <!-- Error Notifications -->
          @if (emailControl.touched && emailControl.errors) {
            <div class="error-container">
              @if (emailControl.errors['required']) {
                <span>Corporate email is required.</span>
              }
              @if (emailControl.errors['email']) {
                <span>Please enter a valid email format.</span>
              }
              @if (emailControl.errors['emailTaken']) {
                <span class="taken-error">
                  ❌ {{ emailControl.errors['emailTaken'].message }}
                </span>
              }
            </div>
          }
        </div>

        <button
          type="submit"
          class="btn-register"
          [disabled]="signupForm.invalid || emailControl.status === 'PENDING'"
        >
          Create Corporate Account
        </button>
      </form>
    </div>
  `,
  styles: [`
    .registration-card { max-width: 440px; margin: 2rem auto; font-family: system-ui, sans-serif; padding: 1.5rem; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
    .form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .input-wrapper { position: relative; display: flex; align-items: center; }
    .form-input { width: 100%; padding: 0.65rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
    .form-input.valid { border-color: #10b981; }
    .form-input.invalid { border-color: #ef4444; background: #fffbfb; }
    .spinner-badge { position: absolute; right: 10px; font-size: 0.75rem; color: #6366f1; font-weight: 600; }
    .success-badge { position: absolute; right: 10px; font-size: 0.8rem; color: #059669; font-weight: 700; }
    .error-container { color: #dc2626; font-size: 0.8rem; margin-top: 0.25rem; }
    .taken-error { font-weight: 600; }
    .btn-register { width: 100%; padding: 0.75rem; background: #4f46e5; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-register:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AsyncEmailValidationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(UserAccountService);

  readonly signupForm: FormGroup = this.fb.group({
    email: [
      '',
      // Synchronous validators execute first
      [Validators.required, Validators.email],
      // Asynchronous validator executes ONLY when sync validators pass
      [uniqueEmailValidator(this.accountService)]
    ]
  });

  get emailControl(): AbstractControl {
    return this.signupForm.get('email')!;
  }

  submit(): void {
    if (this.signupForm.valid) {
      alert(`Account reserved for: ${this.emailControl.value}`);
      this.signupForm.reset();
    }
  }
}
