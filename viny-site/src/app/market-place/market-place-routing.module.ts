import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AuthGuard } from '../shared-modules/auth/auth.guard';
import { NewPostComponent } from './new-post/new-post.component';

const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'new', component: NewPostComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketPlaceRoutingModule {
}
