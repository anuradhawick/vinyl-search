import { Routes } from '@angular/router';
import { authGuard } from '../shared-modules/guards/auth.guard';
import { HomePageComponent } from './home-page/home-page.component';
import { ManageAdminsComponent } from './manage-admins/manage-admins.component';
import { AllAdsComponent } from './manage-market/all-ads/all-ads.component';
import { ApprovedAdsComponent } from './manage-market/approved-ads/approved-ads.component';
import { EditAdComponent } from './manage-market/edit-ad/edit-ad.component';
import { ExpiredAdsComponent } from './manage-market/expired-ads/expired-ads.component';
import { ManageMarketComponent } from './manage-market/manage-market.component';
import { PendingAdsComponent } from './manage-market/pending-ads/pending-ads.component';
import { ManageForumComponent } from './manage-forum/manage-forum.component';
import { ManageRecordsComponent } from './manage-records/manage-records.component';
import { ManageReportsComponent } from './manage-reports/manage-reports.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { AdminService } from './services/admin.service';
import { MarketService } from './services/market.service';
import { UsersService } from './services/users.service';

export const administrationRoutes: Routes = [
  {
    path: '',
    component: HomePageComponent,
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
        component: ManageAdminsComponent,
      },
      {
        path: 'users',
        component: ManageUsersComponent,
      },
      {
        path: 'records',
        component: ManageRecordsComponent,
      },
      {
        path: 'forum',
        component: ManageForumComponent,
      },
      {
        path: 'reports',
        component: ManageReportsComponent,
      },
      {
        path: 'market',
        component: ManageMarketComponent,
        children: [
          {
            path: '',
            redirectTo: 'pending',
            pathMatch: 'full',
          },
          {
            path: 'pending',
            component: PendingAdsComponent,
          },
          {
            path: 'all',
            component: AllAdsComponent,
          },
          {
            path: 'expired',
            component: ExpiredAdsComponent,
          },
          {
            path: 'approved',
            component: ApprovedAdsComponent,
          },
          {
            path: ':postId/edit',
            component: EditAdComponent,
          },
        ],
      },
    ],
  },
];
