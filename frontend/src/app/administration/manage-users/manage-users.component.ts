import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { catchError, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
})
export class ManageUsersComponent implements OnInit {
  protected users: any = [];
  protected loading = false;
  protected skip = 0;
  protected limit = 10;
  protected count = 0;
  protected page = 1;

  constructor(
    private us: UsersService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((p: any) => {
      this.users = [];
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit;
      this.page = page;

      this.loadUsers();
    });
  }

  loadUsers() {
    this.loading = true;
    this.us
      .getUsers(this.skip, this.limit)
      .pipe(catchError(() => of(null)))
      .subscribe((users: any) => {
        if (!!users) {
          this.users = users.users;
          this.count = users.count;
          this.skip = users.skip;
          this.limit = users.limit;
        }
        this.loading = false;
      });
  }

  changePage(event: PageEvent) {
    this.users = [];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + event.pageIndex,
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }
}
