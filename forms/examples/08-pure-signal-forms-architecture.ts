/**
 * 08-pure-signal-forms-architecture.ts
 * ============================================================================
 * Production Pattern: Pure Signal Forms Architecture (Angular 22 Zoneless Ready)
 *
 * Real-World Scenario:
 * - Enterprise Customer Profile Editor with linkedSignal() automatic draft resets.
 * - Zero Zone.js dependencies, pure O(1) synchronous dependency graph.
 * - Validation, dirty tracking, and submission states computed via pure signals.
 * ============================================================================
 */

import { Component, computed, signal, linkedSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserProfileDTO {
  id: string;
  fullName: string;
  title: string;
  department: string;
  workEmail: string;
}

@Component({
  selector: 'app-pure-signal-profile-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="signal-form-card">
      <header class="card-header">
        <h3>Enterprise Profile Editor (Pure Signal Forms)</h3>
        <span class="zoneless-pill">⚡ Zoneless O(1) Reactive</span>
      </header>

      <!-- External Source of Truth (Input Signal) -->
      <div class="profile-switcher">
        <label>Simulate Customer Selection:</label>
        <button
          type="button"
          class="btn-switch"
          (click)="switchUser('101')"
        >
          Load Alice (Architect)
        </button>
        <button
          type="button"
          class="btn-switch"
          (click)="switchUser('102')"
        >
          Load Bob (Security Lead)
        </button>
      </div>

      <form (submit)="onSubmit($event)">
        <!-- Full Name Input -->
        <div class="field">
          <label>Full Name</label>
          <input
            type="text"
            [value]="nameDraft()"
            (input)="onNameInput($event)"
            (blur)="nameTouched.set(true)"
            class="input-box"
            [class.invalid]="nameError() && nameTouched()"
          />
          @if (nameError() && nameTouched()) {
            <span class="error-msg">{{ nameError() }}</span>
          }
        </div>

        <!-- Job Title Input -->
        <div class="field">
          <label>Job Title</label>
          <input
            type="text"
            [value]="titleDraft()"
            (input)="onTitleInput($event)"
            (blur)="titleTouched.set(true)"
            class="input-box"
          />
        </div>

        <!-- Work Email Input -->
        <div class="field">
          <label>Work Email</label>
          <input
            type="email"
            [value]="emailDraft()"
            (input)="onEmailInput($event)"
            (blur)="emailTouched.set(true)"
            class="input-box"
            [class.invalid]="emailError() && emailTouched()"
          />
          @if (emailError() && emailTouched()) {
            <span class="error-msg">{{ emailError() }}</span>
          }
        </div>

        <!-- Form Status Inspector -->
        <div class="inspector-box">
          <div class="metric">
            <span>Is Dirty:</span>
            <strong>{{ isDirty() ? 'YES (Unsaved Changes)' : 'NO' }}</strong>
          </div>
          <div class="metric">
            <span>Is Valid:</span>
            <strong [class.valid]="isValid()" [class.invalid]="!isValid()">
              {{ isValid() ? 'VALID' : 'INVALID' }}
            </strong>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-row">
          <button
            type="button"
            class="btn-discard"
            (click)="discardDraft()"
            [disabled]="!isDirty()"
          >
            Discard Changes
          </button>

          <button
            type="submit"
            class="btn-save"
            [disabled]="!canSubmit()"
          >
            {{ isSaving() ? 'Saving...' : 'Save Profile' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .signal-form-card { max-width: 520px; margin: 2rem auto; font-family: system-ui, sans-serif; background: #fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; }
    .zoneless-pill { font-size: 0.75rem; background: #eff6ff; color: #1d4ed8; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; }
    .profile-switcher { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; font-size: 0.85rem; }
    .btn-switch { padding: 0.35rem 0.65rem; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
    .field { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .input-box { padding: 0.6rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
    .input-box.invalid { border-color: #ef4444; background: #fff5f5; }
    .error-msg { color: #dc2626; font-size: 0.8rem; font-weight: 500; }
    .inspector-box { margin-top: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; font-size: 0.85rem; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
    .valid { color: #16a34a; }
    .invalid { color: #dc2626; }
    .actions-row { margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.75rem; }
    .btn-discard { padding: 0.65rem 1rem; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; }
    .btn-discard:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-save { padding: 0.65rem 1.5rem; background: #059669; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class PureSignalProfileFormComponent {
  // 1. External Remote State (e.g. from service or parent component)
  readonly externalProfile = signal<UserProfileDTO>({
    id: '101',
    fullName: 'Alice Johnson',
    title: 'Principal Software Architect',
    department: 'Platform Architecture',
    workEmail: 'alice.johnson@enterprise.org'
  });

  // 2. linkedSignal() maintains mutable local drafts that automatically reset
  // whenever externalProfile changes!
  readonly nameDraft = linkedSignal(() => this.externalProfile().fullName);
  readonly titleDraft = linkedSignal(() => this.externalProfile().title);
  readonly emailDraft = linkedSignal(() => this.externalProfile().workEmail);

  // 3. User interaction tracking
  readonly nameTouched = signal(false);
  readonly titleTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly isSaving = signal(false);

  // 4. Pure Computed Validation Rules
  readonly nameError = computed(() => {
    const val = this.nameDraft().trim();
    if (!val) return 'Full name is required.';
    if (val.length < 3) return 'Full name must be at least 3 characters.';
    return null;
  });

  readonly emailError = computed(() => {
    const val = this.emailDraft().trim();
    if (!val) return 'Work email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Invalid email address format.';
    return null;
  });

  // 5. Derived Form Validity
  readonly isValid = computed(() => !this.nameError() && !this.emailError());

  // 6. Dirty State (Has draft diverged from initial external profile?)
  readonly isDirty = computed(() => {
    const orig = this.externalProfile();
    return (
      this.nameDraft() !== orig.fullName ||
      this.titleDraft() !== orig.title ||
      this.emailDraft() !== orig.workEmail
    );
  });

  readonly canSubmit = computed(() => this.isValid() && this.isDirty() && !this.isSaving());

  // Input Handlers
  onNameInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.nameDraft.set(val);
  }

  onTitleInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.titleDraft.set(val);
  }

  onEmailInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.emailDraft.set(val);
  }

  discardDraft(): void {
    const orig = this.externalProfile();
    this.nameDraft.set(orig.fullName);
    this.titleDraft.set(orig.title);
    this.emailDraft.set(orig.workEmail);
    this.nameTouched.set(false);
    this.emailTouched.set(false);
  }

  switchUser(id: string): void {
    if (id === '101') {
      this.externalProfile.set({
        id: '101',
        fullName: 'Alice Johnson',
        title: 'Principal Software Architect',
        department: 'Platform Architecture',
        workEmail: 'alice.johnson@enterprise.org'
      });
    } else {
      this.externalProfile.set({
        id: '102',
        fullName: 'Bob Martinez',
        title: 'Lead Security Engineer',
        department: 'AppSec & Compliance',
        workEmail: 'bob.martinez@enterprise.org'
      });
    }
    // linkedSignal automatically updates drafts!
    this.nameTouched.set(false);
    this.emailTouched.set(false);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) return;

    this.isSaving.set(true);

    const updatedProfile: UserProfileDTO = {
      ...this.externalProfile(),
      fullName: this.nameDraft(),
      title: this.titleDraft(),
      workEmail: this.emailDraft()
    };

    console.log('Dispatching updated profile:', updatedProfile);

    setTimeout(() => {
      this.externalProfile.set(updatedProfile);
      this.isSaving.set(false);
      alert('Profile successfully saved via Pure Signal Form!');
    }, 800);
  }
}

