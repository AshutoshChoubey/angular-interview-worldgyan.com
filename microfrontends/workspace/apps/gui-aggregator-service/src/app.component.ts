import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShellHeaderComponent } from './components/shell-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ShellHeaderComponent],
  template: `
    <app-shell-header />
    <router-outlet />
  `
})
export class AppComponent {}

