import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TopologyManagerRootComponent } from './app/topology-manager/topology-manager-root.component';

bootstrapApplication(TopologyManagerRootComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideHttpClient()
  ]
}).catch(err => console.error(err));
