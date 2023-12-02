import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { ManageAdminsComponent } from './manage-admins/manage-admins.component';
import { ManageRecordsComponent } from './manage-records/manage-records.component';
import { ManageForumComponent } from './manage-forum/manage-forum.component';
import { ManageMarketComponent } from './manage-market/manage-market.component';
import { PendingAdsComponent } from './manage-market/pending-ads/pending-ads.component';
import { AllAdsComponent } from './manage-market/all-ads/all-ads.component';
import { ExpiredAdsComponent } from './manage-market/expired-ads/expired-ads.component';
import { ApprovedAdsComponent } from './manage-market/approved-ads/approved-ads.component';
import { EditAdComponent } from './manage-market/edit-ad/edit-ad.component';
import { ManageReportsComponent } from './manage-reports/manage-reports.component';
import { authGuard } from '../shared-modules/guards/auth.guard';
import { ManageUsersComponent } from './manage-users/manage-users.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministrationRoutingModule {}
