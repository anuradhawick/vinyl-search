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

@NgModule({
  declarations: [HomePageComponent, ManageAdminsComponent, ManageRecordsComponent, ManageForumComponent, AdminActionConfirmModalComponent],
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
