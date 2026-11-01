import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'fault-management',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('fault-management', './Module')
        .then(m => m.FAULT_MANAGEMENT_ROUTES)
  },
  {
    path: 'topology',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('topology-manager', './Module')
        .then(m => m.TOPOLOGY_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
