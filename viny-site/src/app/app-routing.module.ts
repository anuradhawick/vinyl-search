import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home/home-page/home-page.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'forum',
    loadChildren: () => import('./forum-management/forum-management.module').then(mod => mod.ForumManagementModule)
  },
  {
    path: 'records',
    loadChildren: () => import('./records-management/records-management.module').then(mod => mod.RecordsManagementModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
