import {
  Component,
  input,
  output,
  model,
  viewChild,
  ElementRef,
  computed
} from '@angular/core';

/**
 * Example 4: Modern Signal-Based Component APIs (Angular 17+ / 18+)
 * Covers: input(), input.required(), output(), model(), and viewChild()
 */

@Component({
  selector: 'app-counter-widget',
  standalone: true,
  template: `
    <div class="widget" [class.dark]="theme() === 'dark'">
      <input #labelInput type="text" [value]="label()" />
      <h4>{{ label() }}</h4>
      <p>Value: {{ count() }} (Double: {{ doubleCount() }})</p>

      <button (click)="increment()">+1</button>
      <button (click)="decrement()">-1</button>
      <button (click)="focusInput()">Focus Label</button>
    </div>
  `
})
export class CounterWidgetComponent {
  // 1. input() & input.required()
  label = input<string>('Counter');
  theme = input<'light' | 'dark'>('light');
  step = input(1, {
    transform: (val: number | string) => (typeof val === 'string' ? parseInt(val, 10) : val)
  });

  // 2. model() for Two-Way Binding (Banana-in-a-box [(count)]="myVal")
  count = model<number>(0);

  // 3. output() for Events
  thresholdReached = output<number>();

  // 4. viewChild() Signal Query
  labelInput = viewChild.required<ElementRef<HTMLInputElement>>('labelInput');

  // Computed from model input
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + this.step());
    if (this.count() >= 100) {
      this.thresholdReached.emit(this.count());
    }
  }

  decrement() {
    this.count.update(c => c - this.step());
  }

  focusInput() {
    this.labelInput().nativeElement.focus();
  }
}
