import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home/home-page/home-page.component';
import { AuthGuard } from './shared-modules/auth/auth.guard';
import { AdminGuard } from './shared-modules/auth/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./pages/privacy-policy-page/privacy-policy-page.module').then(mod => mod.PrivacyPolicyPageModule)
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
  },
  {
    path: 'admin',
    loadChildren: () => import('./administration/administration.module').then(mod => mod.AdministrationModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'market',
    loadChildren: () => import('./market-place/market-place.module').then(mod => mod.MarketPlaceModule),
    canActivate: []
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
