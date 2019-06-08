import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecordsHomePageComponent } from './records-home-page/records-home-page.component';
import { RecordsEditPageComponent } from './records-edit-page/records-edit-page.component';
import { AuthGuard } from '../shared-modules/auth/auth.guard';
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
    canActivate: [AuthGuard]
  },
  {path: ':recordId/view', component: RecordViewPageComponent},
  {path: ':recordId/update', component: RecordsUpdatePageComponent},
  {path: ':recordId/revisions/:revisionId', component: RecordsRevisionViewPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecordsManagementRoutingModule {
}
