import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserHomePageComponent } from './user-home-page/user-home-page.component';

const routes: Routes = [
  {
    path: '',
    component: UserHomePageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
