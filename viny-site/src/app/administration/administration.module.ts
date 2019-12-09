import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrationRoutingModule } from './administration-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { AdminService } from './services/admin.service';
import { SharedModules } from '../shared-modules/shared.module';
import { ManageAdminsComponent } from './manage-admins/manage-admins.component';
import { ManageRecordsComponent } from './manage-records/manage-records.component';
import { ManageForumComponent } from './manage-forum/manage-forum.component';
import { AdminActionConfirmModalComponent } from './modals/admin-action-confirm-modal/admin-action-confirm-modal.component';
import { ManageMarketComponent } from './manage-market/manage-market.component';
import { PendingAdsComponent } from './manage-market/pending-ads/pending-ads.component';
import { AllAdsComponent } from './manage-market/all-ads/all-ads.component';
import { ExpiredAdsComponent } from './manage-market/expired-ads/expired-ads.component';
import { ApprovedAdsComponent } from './manage-market/approved-ads/approved-ads.component';

@NgModule({
  declarations: [HomePageComponent, ManageAdminsComponent, ManageRecordsComponent, ManageForumComponent, AdminActionConfirmModalComponent, ManageMarketComponent, PendingAdsComponent, AllAdsComponent, ExpiredAdsComponent, ApprovedAdsComponent],
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    SharedModules
  ],
  providers: [AdminService],
  entryComponents: [AdminActionConfirmModalComponent]
})
export class AdministrationModule {
}
