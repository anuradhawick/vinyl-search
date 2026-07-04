import { Routes } from '@angular/router';

import { adminGuard } from './shared/guards/admin.guard';
import { authGuard } from './shared/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home-page/home-page.component').then(
        (m) => m.HomePageComponent,
      ),
  },
  {
    path: 'forum',
    loadChildren: () =>
      import('./forum-management/forum-management.routes').then(
        (mod) => mod.forumManagementRoutes,
      ),
  },
  {
    path: 'records',
    loadChildren: () =>
      import('./records-management/records-management.routes').then(
        (mod) => mod.recordsManagementRoutes,
      ),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./user-management/user-management.routes').then(
        (mod) => mod.userManagementRoutes,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'market',
    loadChildren: () =>
      import('./market-place/market-place.routes').then(
        (mod) => mod.marketPlaceRoutes,
      ),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./administration/administration.routes').then(
        (mod) => mod.administrationRoutes,
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'privacy-policy',
    loadChildren: () =>
      import('./home/privacy-policy-page/privacy-policy-page.routes').then(
        (mod) => mod.privacyPolicyPageRoutes,
      ),
  },
];
