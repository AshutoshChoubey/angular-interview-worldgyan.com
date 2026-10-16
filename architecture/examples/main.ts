/**
 * src/main.ts — Angular 22 Client Entrypoint
 * 
 * Demonstrates modern standalone bootstrapApplication without AppModule or zone.js.
 */
import { bootstrapApplication } from '@angular/core';
import { appConfig } from './app.config';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto;">
      <h1>Angular 22 Architecture — worldgyan.com</h1>
      <p>Modern Zoneless execution powered by Signals and Vite/esbuild.</p>
      
      <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
        <p>Current Counter Signal: <strong>{{ count() }}</strong></p>
        <button (click)="increment()" style="padding: 0.5rem 1rem; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Increment Counter
        </button>
      </div>
    </main>
  `
})
export class AppComponent {
  count = signal(0);

  increment() {
    this.count.update(n => n + 1);
  }
}

// Global bootstrap invocation
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('Fatal Angular Bootstrap Error:', err);
  });

