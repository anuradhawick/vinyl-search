import { Routes } from '@angular/router';
import { authGuard } from '../shared/guards/auth.guard';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { NewPostComponent } from './new-post/new-post.component';
import { PostEditPageComponent } from './post-edit-page/post-edit-page.component';
import { PostViewPageComponent } from './post-view-page/post-view-page.component';
import { MarketService } from './services/market.service';

export const marketPlaceRoutes: Routes = [
  {
    path: '',
    providers: [MarketService],
    children: [
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
    ],
  },
];
