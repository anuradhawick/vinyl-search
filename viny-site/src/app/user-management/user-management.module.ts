import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserHomePageComponent } from './user-home-page/user-home-page.component';
import { MyRecordsComponent } from './my-records/my-records.component';
import { MyForumComponent } from './my-forum/my-forum.component';
import { UpdateDetailsComponent } from './update-details/update-details.component';
import { SharedModules } from '../shared-modules/shared.module';
import { ForumShouldDeleteModalComponent } from './modals/forum-should-delete/forum-should-delete.component';
import { RecordShouldDeleteModalComponent } from './modals/record-should-delete-modal/record-should-delete-modal.component';
import { MyMarketComponent } from './my-market/my-market.component';

@NgModule({
  declarations: [UserHomePageComponent,
    MyRecordsComponent,
    MyForumComponent,
    UpdateDetailsComponent,
    ForumShouldDeleteModalComponent,
    RecordShouldDeleteModalComponent,
    MyMarketComponent],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    SharedModules
  ],
  entryComponents: [
    ForumShouldDeleteModalComponent,
    RecordShouldDeleteModalComponent
  ]
})
export class UserManagementModule {
}
