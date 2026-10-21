/**
 * 01-template-driven-form-basics.ts
 * ============================================================================
 * Production Pattern: Template-Driven Forms in Angular 22 (Standalone)
 *
 * Use Cases:
 * - Simple data entry, search filters, login, and newsletter signups.
 * - Declarative forms where the HTML template is the source of truth.
 * - Minimal TypeScript boilerplate with ngModel two-way data binding.
 * ============================================================================
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export interface UserSubscription {
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  acceptTerms: boolean;
}

@Component({
  selector: 'app-template-driven-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="signup-container">
      <h2>Subscribe to Tech Briefing</h2>

      <!-- Form source of truth resides in template directives -->
      <form #signupForm="ngForm" (ngSubmit)="onSubmit(signupForm)" novalidate>
        
        <!-- Email Input with ngModel validation -->
        <div class="form-group">
          <label for="email">Work Email</label>
          <input
            id="email"
            type="email"
            name="email"
            [(ngModel)]="model.email"
            #emailCtrl="ngModel"
            required
            email
            placeholder="developer@worldgyan.com"
            class="form-control"
            [class.is-invalid]="emailCtrl.invalid && (emailCtrl.dirty || emailCtrl.touched)"
          />

          @if (emailCtrl.invalid && (emailCtrl.dirty || emailCtrl.touched)) {
            <div class="error-message">
              @if (emailCtrl.errors?.['required']) {
                <span>Email address is required.</span>
              }
              @if (emailCtrl.errors?.['email']) {
                <span>Please enter a valid RFC-compliant email address.</span>
              }
            </div>
          }
        </div>

        <!-- Plan Selection -->
        <div class="form-group">
          <label for="plan">Subscription Tier</label>
          <select
            id="plan"
            name="plan"
            [(ngModel)]="model.plan"
            #planCtrl="ngModel"
            required
            class="form-control"
          >
            <option value="free">Free Tier (Weekly Digest)</option>
            <option value="pro">Pro Tier (Daily Deep Dives)</option>
            <option value="enterprise">Enterprise (Team Architecture Reviews)</option>
          </select>
        </div>

        <!-- Checkbox with RequiredTrue Validation -->
        <div class="form-group-checkbox">
          <input
            type="checkbox"
            id="acceptTerms"
            name="acceptTerms"
            [(ngModel)]="model.acceptTerms"
            #termsCtrl="ngModel"
            required
          />
          <label for="acceptTerms">I accept the Developer Terms of Service</label>

          @if (termsCtrl.invalid && termsCtrl.touched) {
            <div class="error-message">You must accept the terms before proceeding.</div>
          }
        </div>

        <!-- Submission Action -->
        <button
          type="submit"
          class="btn-submit"
          [disabled]="signupForm.invalid || isSubmitting"
        >
          {{ isSubmitting ? 'Subscribing...' : 'Complete Subscription' }}
        </button>
      </form>

      <!-- Live Inspection Snapshot -->
      <div class="form-status-panel">
        <p><strong>Form Status:</strong> {{ signupForm.status }}</p>
        <p><strong>Dirty:</strong> {{ signupForm.dirty }} | <strong>Touched:</strong> {{ signupForm.touched }}</p>
        <p><strong>Payload:</strong> {{ signupForm.value | json }}</p>
      </div>
    </div>
  `,
  styles: [`
    .signup-container { max-width: 480px; margin: 2rem auto; font-family: system-ui, sans-serif; }
    .form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .form-control { padding: 0.6rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
    .form-control.is-invalid { border-color: #ef4444; background: #fff5f5; }
    .error-message { color: #dc2626; font-size: 0.8rem; font-weight: 500; }
    .btn-submit { padding: 0.75rem 1.5rem; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .form-status-panel { margin-top: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 6px; font-size: 0.85rem; border: 1px solid #e2e8f0; }
  `]
})
export class TemplateDrivenSignupComponent {
  model: UserSubscription = {
    email: '',
    plan: 'free',
    acceptTerms: false
  };

  isSubmitting = false;

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    console.log('Template Form Submitted:', form.value);

    // Simulate network submission
    setTimeout(() => {
      this.isSubmitting = false;
      alert(`Subscription confirmed for: ${form.value.email}`);
      form.resetForm({ plan: 'free', acceptTerms: false });
    }, 800);
  }
}
