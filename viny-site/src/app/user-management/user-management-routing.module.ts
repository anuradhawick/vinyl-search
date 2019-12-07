import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserHomePageComponent } from './user-home-page/user-home-page.component';
import { MyRecordsComponent } from './my-records/my-records.component';
import { MyForumComponent } from './my-forum/my-forum.component';
import { UpdateDetailsComponent } from './update-details/update-details.component';
import { MyMarketComponent } from './my-market/my-market.component';

const routes: Routes = [
  {
    path: '',
    component: UserHomePageComponent,
    children: [
      {
        path: '',
        redirectTo: 'update-profile'
      },
      {
        path: 'records',
        component: MyRecordsComponent
      },
      {
        path: 'forum',
        component: MyForumComponent
      },
      {
        path: 'market',
        component: MyMarketComponent
      },
      {
        path: 'update-profile',
        component: UpdateDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule {
}
