import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home/home-page/home-page.component';
import { AuctionsPageComponent } from './events/auctions-page/auctions-page.component';
import { ForumHomePageComponent } from './forum/forum-home-page/forum-home-page.component';
import { ForumEditPageComponent } from './forum/forum-edit-page/forum-edit-page.component';
import { ForumViewPageComponent } from './forum/forum-view-page/forum-view-page.component';
import { RecordsHomePageComponent } from './records/records-home-page/records-home-page.component';
import { RecordsEditPageComponent } from './records/records-edit-page/records-edit-page.component';

const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'forum', component: ForumHomePageComponent},
  {path: 'forum/:postId/view', component: ForumViewPageComponent},
  {path: 'forum/editor', component: ForumEditPageComponent},
  {path: 'forum/:postId/edit', component: ForumEditPageComponent},
  {path: 'events/auctions', component: AuctionsPageComponent},
  {path: 'records', component: RecordsHomePageComponent},
  {path: 'records/new', component: RecordsEditPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
