import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrationRoutingModule } from './administration-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { AdminService } from './services/admin.service';
import { SharedModules } from '../shared-modules/shared.module';
import { ManageAdminsComponent } from './manage-admins/manage-admins.component';
import { ManageRecordsComponent } from './manage-records/manage-records.component';
import { ManageForumComponent } from './manage-forum/manage-forum.component';
import { ManageMarketComponent } from './manage-market/manage-market.component';
import { PendingAdsComponent } from './manage-market/pending-ads/pending-ads.component';
import { AllAdsComponent } from './manage-market/all-ads/all-ads.component';
import { ExpiredAdsComponent } from './manage-market/expired-ads/expired-ads.component';
import { ApprovedAdsComponent } from './manage-market/approved-ads/approved-ads.component';
import { EditAdComponent } from './manage-market/edit-ad/edit-ad.component';
import { PostEditorModule } from '../market-place/post-editor-module/post-editor-module.module';
import { ManageReportsComponent } from './manage-reports/manage-reports.component';
import { MarketService } from './services/market.service';

@NgModule({
  declarations: [
    HomePageComponent,
    ManageAdminsComponent,
    ManageRecordsComponent,
    ManageForumComponent,
    ManageMarketComponent,
    PendingAdsComponent,
    AllAdsComponent,
    ExpiredAdsComponent,
    ApprovedAdsComponent,
    EditAdComponent,
    ManageReportsComponent,
  ],
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    SharedModules,
    PostEditorModule,
  ],
  providers: [AdminService, MarketService],
})
export class AdministrationModule {
}
