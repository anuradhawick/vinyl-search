import { Routes } from '@angular/router';

export const privacyPolicyPageRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./privacy-policy-page.component').then(
        (m) => m.PrivacyPolicyPageComponent,
      ),
  },
];
