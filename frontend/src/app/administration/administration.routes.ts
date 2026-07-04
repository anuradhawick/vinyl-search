import { Routes } from '@angular/router';
import { authGuard } from '../shared/guards/auth.guard';

import { AdminService } from './services/admin.service';
import { MarketService } from './services/market.service';
import { UsersService } from './services/users.service';

export const administrationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home-page/home-page.component').then(
        (m) => m.HomePageComponent,
      ),
    providers: [AdminService, MarketService, UsersService],
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./manage-admins/manage-admins.component').then(
            (m) => m.ManageAdminsComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./manage-users/manage-users.component').then(
            (m) => m.ManageUsersComponent,
          ),
      },
      {
        path: 'records',
        loadComponent: () =>
          import('./manage-records/manage-records.component').then(
            (m) => m.ManageRecordsComponent,
          ),
      },
      {
        path: 'forum',
        loadComponent: () =>
          import('./manage-forum/manage-forum.component').then(
            (m) => m.ManageForumComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./manage-reports/manage-reports.component').then(
            (m) => m.ManageReportsComponent,
          ),
      },
      {
        path: 'market',
        loadComponent: () =>
          import('./manage-market/manage-market.component').then(
            (m) => m.ManageMarketComponent,
          ),
        children: [
          {
            path: '',
            redirectTo: 'pending',
            pathMatch: 'full',
          },
          {
            path: 'pending',
            loadComponent: () =>
              import('./manage-market/pending-ads/pending-ads.component').then(
                (m) => m.PendingAdsComponent,
              ),
          },
          {
            path: 'all',
            loadComponent: () =>
              import('./manage-market/all-ads/all-ads.component').then(
                (m) => m.AllAdsComponent,
              ),
          },
          {
            path: 'expired',
            loadComponent: () =>
              import('./manage-market/expired-ads/expired-ads.component').then(
                (m) => m.ExpiredAdsComponent,
              ),
          },
          {
            path: 'approved',
            loadComponent: () =>
              import(
                './manage-market/approved-ads/approved-ads.component'
              ).then((m) => m.ApprovedAdsComponent),
          },
          {
            path: ':postId/edit',
            loadComponent: () =>
              import('./manage-market/edit-ad/edit-ad.component').then(
                (m) => m.EditAdComponent,
              ),
          },
        ],
      },
    ],
  },
];
