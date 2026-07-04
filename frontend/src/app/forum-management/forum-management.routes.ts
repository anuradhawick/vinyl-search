import { Routes } from '@angular/router';
import { authGuard } from '../shared/guards/auth.guard';

import { ForumService } from './services/forum.service';

export const forumManagementRoutes: Routes = [
  {
    path: '',
    providers: [ForumService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./forum-home-page/forum-home-page.component').then(
            (m) => m.ForumHomePageComponent,
          ),
      },
      {
        path: ':postId/view',
        loadComponent: () =>
          import('./forum-view-page/forum-view-page.component').then(
            (m) => m.ForumViewPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./forum-edit-page/forum-edit-page.component').then(
            (m) => m.ForumEditPageComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: ':postId/edit',
        loadComponent: () =>
          import('./forum-edit-page/forum-edit-page.component').then(
            (m) => m.ForumEditPageComponent,
          ),
        canActivate: [authGuard],
      },
    ],
  },
];
