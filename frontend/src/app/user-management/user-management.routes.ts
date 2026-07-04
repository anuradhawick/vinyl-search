import { Routes } from '@angular/router';

export const userManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-home-page/user-home-page.component').then(
        (m) => m.UserHomePageComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'update',
        pathMatch: 'full',
      },
      {
        path: 'records',
        loadComponent: () =>
          import('./my-records/my-records.component').then(
            (m) => m.MyRecordsComponent,
          ),
      },
      {
        path: 'forum',
        loadComponent: () =>
          import('./my-forum/my-forum.component').then(
            (m) => m.MyForumComponent,
          ),
      },
      {
        path: 'market',
        loadComponent: () =>
          import('./my-market/my-market.component').then(
            (m) => m.MyMarketComponent,
          ),
      },
      {
        path: 'update',
        loadComponent: () =>
          import('./update-details/update-details.component').then(
            (m) => m.UpdateDetailsComponent,
          ),
      },
    ],
  },
];
