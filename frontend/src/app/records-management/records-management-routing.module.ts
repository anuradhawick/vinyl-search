import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecordsHomePageComponent } from './records-home-page/records-home-page.component';
import { RecordsEditPageComponent } from './records-edit-page/records-edit-page.component';
import { authGuard } from '../shared-modules/auth/auth.guard';
import { RecordViewPageComponent } from './record-view-page/record-view-page.component';
import { RecordsUpdatePageComponent } from './records-update-page/records-update-page.component';
import { RecordsRevisionViewPageComponent } from './records-revision-view-page/records-revision-view-page.component';

const routes: Routes = [
  {
    path: '',
    component: RecordsHomePageComponent
  },
  {
    path: 'new', component: RecordsEditPageComponent,
    canActivate: [authGuard]
  },
  {
    path: ':recordId/view', component: RecordViewPageComponent,
    canActivate: [authGuard]
  },
  {
    path: ':recordId/update', component: RecordsUpdatePageComponent,
    canActivate: [authGuard]
  },
  {
    path: ':recordId/revisions/:revisionId', component: RecordsRevisionViewPageComponent,
    canActivate: [authGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecordsManagementRoutingModule {
}
