import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForumHomePageComponent } from './forum-home-page/forum-home-page.component';
import { ForumViewPageComponent } from './forum-view-page/forum-view-page.component';
import { ForumEditPageComponent } from './forum-edit-page/forum-edit-page.component';
import { AuthGuard } from '../shared-modules/auth/auth.guard';

const routes: Routes = [
  {path: '', component: ForumHomePageComponent},
  {path: ':postId/view', component: ForumViewPageComponent},
  {
    path: 'editor', component: ForumEditPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':postId/edit', component: ForumEditPageComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForumManagementRoutingModule {
}
