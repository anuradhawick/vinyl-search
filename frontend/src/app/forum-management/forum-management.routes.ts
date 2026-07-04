import { Routes } from '@angular/router';
import { authGuard } from '../shared-modules/guards/auth.guard';
import { ForumEditPageComponent } from './forum-edit-page/forum-edit-page.component';
import { ForumHomePageComponent } from './forum-home-page/forum-home-page.component';
import { ForumViewPageComponent } from './forum-view-page/forum-view-page.component';
import { ForumService } from './services/forum.service';

export const forumManagementRoutes: Routes = [
  {
    path: '',
    providers: [ForumService],
    children: [
      { path: '', component: ForumHomePageComponent },
      { path: ':postId/view', component: ForumViewPageComponent },
      {
        path: 'new',
        component: ForumEditPageComponent,
        canActivate: [authGuard],
      },
      {
        path: ':postId/edit',
        component: ForumEditPageComponent,
        canActivate: [authGuard],
      },
    ],
  },
];
