import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrationRoutingModule } from './administration-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { AdminService } from './services/admin.service';
import { SharedModules } from '../shared-modules/shared.module';
import { ManageAdminsComponent } from './manage-admins/manage-admins.component';

@NgModule({
  declarations: [HomePageComponent, ManageAdminsComponent],
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    SharedModules
  ],
  providers: [AdminService]
})
export class AdministrationModule {
}
