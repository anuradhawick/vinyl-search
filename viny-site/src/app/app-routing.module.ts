import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home/home-page/home-page.component';
import { AuthGuard } from './shared-modules/auth/auth.guard';
import { PrivacyPolicyPageComponent } from './pages/privacy-policy-page/privacy-policy-page.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyPageComponent
  },
  {
    path: 'forum',
    loadChildren: () => import('./forum-management/forum-management.module').then(mod => mod.ForumManagementModule)
  },
  {
    path: 'records',
    loadChildren: () => import('./records-management/records-management.module').then(mod => mod.RecordsManagementModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./user-management/user-management.module').then(mod => mod.UserManagementModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
