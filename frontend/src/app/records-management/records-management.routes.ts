import { Routes } from '@angular/router';
import { authGuard } from '../shared-modules/guards/auth.guard';
import { RecordViewPageComponent } from './record-view-page/record-view-page.component';
import { RecordsEditPageComponent } from './records-edit-page/records-edit-page.component';
import { RecordsHomePageComponent } from './records-home-page/records-home-page.component';
import { RecordsService } from './services/records.service';

export const recordsManagementRoutes: Routes = [
  {
    path: '',
    providers: [RecordsService],
    children: [
      {
        path: '',
        component: RecordsHomePageComponent,
      },
      {
        path: 'new',
        component: RecordsEditPageComponent,
        canActivate: [authGuard],
      },
      {
        path: ':recordId/edit',
        component: RecordsEditPageComponent,
        canActivate: [authGuard],
      },
      {
        path: ':recordId/view',
        component: RecordViewPageComponent,
        canActivate: [authGuard],
      },
      {
        path: ':recordId/revisions/:revisionId',
        component: RecordViewPageComponent,
        canActivate: [authGuard],
      },
    ],
  },
];
