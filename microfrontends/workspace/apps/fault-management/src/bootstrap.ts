import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { FaultManagementRootComponent } from './app/fault-management/fault-management-root.component';

// Standalone execution support for independent testing
bootstrapApplication(FaultManagementRootComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideHttpClient()
  ]
}).catch(err => console.error(err));
