import { Routes } from '@angular/router';
import { authGuard } from '../shared/guards/auth.guard';

import { MarketService } from './services/market.service';

export const marketPlaceRoutes: Routes = [
  {
    path: '',
    providers: [MarketService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./landing-page/landing-page.component').then(
            (m) => m.LandingPageComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./new-post/new-post.component').then(
            (m) => m.NewPostComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: ':postId/view',
        loadComponent: () =>
          import('./post-view-page/post-view-page.component').then(
            (m) => m.PostViewPageComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: ':postId/edit',
        loadComponent: () =>
          import('./post-edit-page/post-edit-page.component').then(
            (m) => m.PostEditPageComponent,
          ),
        canActivate: [authGuard],
      },
    ],
  },
];
