import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { ManageAdminsComponent } from './manage-admins/manage-admins.component';
import { ManageRecordsComponent } from './manage-records/manage-records.component';
import { ManageForumComponent } from './manage-forum/manage-forum.component';

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
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
