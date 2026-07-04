import { Component, OnInit, signal } from '@angular/core';
import { UsersService } from '../services/users.service';
import { catchError, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import {
  MatList,
  MatListItem,
  MatListItemAvatar,
  MatListItemTitle,
  MatListItemLine,
} from '@angular/material/list';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
  imports: [
    MatList,
    MatListItem,
    MatListItemAvatar,
    MatListItemTitle,
    MatListItemLine,
    LoaderComponent,
    MatPaginator,
  ],
})
export class ManageUsersComponent implements OnInit {
  protected users = signal<any[]>([]);
  protected loading = signal(false);
  protected skip = 0;
  protected limit = signal(10);
  protected count = signal(0);
  protected page = signal(1);

  constructor(
    private us: UsersService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((p: any) => {
      this.users.set([]);
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit();
      this.page.set(page);

      this.loadUsers();
    });
  }

  loadUsers() {
    this.loading.set(true);
    this.us
      .getUsers(this.skip, this.limit())
      .pipe(catchError(() => of(null)))
      .subscribe((users: any) => {
        if (!!users) {
          this.users.set(users.users);
          this.count.set(users.count);
          this.skip = users.skip;
          this.limit.set(users.limit);
        }
        this.loading.set(false);
      });
  }

  changePage(event: PageEvent) {
    this.users.set([]);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + event.pageIndex,
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }
}
