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

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    children: [
      {
        path: '',
        redirectTo: 'home'
      },
      {
        path: 'home',
        component: ManageAdminsComponent
      },
      {
        path: 'records',
        component: ManageRecordsComponent
      },
      {
        path: 'forum',
        component: ManageForumComponent
      },
      {
        path: 'market',
        component: ManageMarketComponent,
        children: [
          {
            path: '',
            redirectTo: 'pending'
          },
          {
            path: 'pending',
            component: PendingAdsComponent
          },
          {
            path: 'all',
            component: AllAdsComponent
          },
          {
            path: 'expired',
            component: ExpiredAdsComponent
          },
          {
            path: 'approved',
            component: ApprovedAdsComponent
          }
        ]
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
