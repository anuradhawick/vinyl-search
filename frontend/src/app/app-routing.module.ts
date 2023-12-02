import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home/home-page/home-page.component';
import { authGuard } from './shared-modules/guards/auth.guard';
import { adminGuard } from './shared-modules/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'forum',
    loadChildren: () =>
      import('./forum-management/forum-management.module').then(
        (mod) => mod.ForumManagementModule,
      ),
  },
  {
    path: 'records',
    loadChildren: () =>
      import('./records-management/records-management.module').then(
        (mod) => mod.RecordsManagementModule,
      ),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./user-management/user-management.module').then(
        (mod) => mod.UserManagementModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'market',
    loadChildren: () =>
      import('./market-place/market-place.module').then(
        (mod) => mod.MarketPlaceModule,
      ),
    canActivate: [],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./administration/administration.module').then(
        (mod) => mod.AdministrationModule,
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'privacy-policy',
    loadChildren: () =>
      import('./pages/privacy-policy-page/privacy-policy-page.module').then(
        (mod) => mod.PrivacyPolicyPageModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
