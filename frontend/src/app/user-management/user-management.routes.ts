import { Routes } from '@angular/router';
import { MyForumComponent } from './my-forum/my-forum.component';
import { MyMarketComponent } from './my-market/my-market.component';
import { MyRecordsComponent } from './my-records/my-records.component';
import { UpdateDetailsComponent } from './update-details/update-details.component';
import { UserHomePageComponent } from './user-home-page/user-home-page.component';

export const userManagementRoutes: Routes = [
  {
    path: '',
    component: UserHomePageComponent,
    children: [
      {
        path: '',
        redirectTo: 'update',
        pathMatch: 'full',
      },
      {
        path: 'records',
        component: MyRecordsComponent,
      },
      {
        path: 'forum',
        component: MyForumComponent,
      },
      {
        path: 'market',
        component: MyMarketComponent,
      },
      {
        path: 'update',
        component: UpdateDetailsComponent,
      },
    ],
  },
];
