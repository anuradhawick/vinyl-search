import { Routes } from '@angular/router';
import { authGuard } from '../shared/guards/auth.guard';

import { RecordsService } from './services/records.service';

export const recordsManagementRoutes: Routes = [
  {
    path: '',
    providers: [RecordsService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./records-home-page/records-home-page.component').then(
            (m) => m.RecordsHomePageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./records-edit-page/records-edit-page.component').then(
            (m) => m.RecordsEditPageComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: ':recordId/edit',
        loadComponent: () =>
          import('./records-edit-page/records-edit-page.component').then(
            (m) => m.RecordsEditPageComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: ':recordId/view',
        loadComponent: () =>
          import('./record-view-page/record-view-page.component').then(
            (m) => m.RecordViewPageComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: ':recordId/revisions/:revisionId',
        loadComponent: () =>
          import('./record-view-page/record-view-page.component').then(
            (m) => m.RecordViewPageComponent,
          ),
        canActivate: [authGuard],
      },
    ],
  },
];
