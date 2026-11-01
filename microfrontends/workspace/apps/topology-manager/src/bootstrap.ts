import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TopologyManagerRootComponent } from './app/topology-manager/topology-manager-root.component';

bootstrapApplication(TopologyManagerRootComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient()
  ]
}).catch(err => console.error(err));
