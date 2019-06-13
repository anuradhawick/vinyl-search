import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserHomePageComponent } from './user-home-page/user-home-page.component';
import { MyRecordsComponent } from './my-records/my-records.component';
import { MyForumComponent } from './my-forum/my-forum.component';
import { UpdateDetailsComponent } from './update-details/update-details.component';

@NgModule({
  declarations: [UserHomePageComponent, MyRecordsComponent, MyForumComponent, UpdateDetailsComponent],
  imports: [
    CommonModule,
    UserManagementRoutingModule
  ]
})
export class UserManagementModule { }
