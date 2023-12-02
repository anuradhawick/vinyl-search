import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { authGuard } from '../shared-modules/auth/auth.guard';
import { NewPostComponent } from './new-post/new-post.component';
import { PostViewPageComponent } from './post-view-page/post-view-page.component';
import { PostEditPageComponent } from './post-edit-page/post-edit-page.component';

const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'new',
    component: NewPostComponent,
    canActivate: [authGuard],
  },
  {
    path: ':postId/view',
    component: PostViewPageComponent,
    canActivate: [authGuard],
  },
  {
    path: ':postId/edit',
    component: PostEditPageComponent,
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarketPlaceRoutingModule {}
