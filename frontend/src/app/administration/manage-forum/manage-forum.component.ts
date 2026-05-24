import { Component, OnInit, signal } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { AdminActionConfirmModalComponent } from '../modals/admin-action-confirm-modal/admin-action-confirm-modal.component';
import * as _ from 'lodash';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import {
  MatList,
  MatListItem,
  MatListItemAvatar,
  MatListItemTitle,
  MatListItemLine,
} from '@angular/material/list';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-manage-forum',
  templateUrl: './manage-forum.component.html',
  styleUrls: ['./manage-forum.component.css'],
  imports: [
    LoaderComponent,
    MatList,
    MatListItem,
    MatListItemAvatar,
    MatListItemTitle,
    MatListItemLine,
    MatIconButton,
    RouterLink,
    MatIcon,
    MatPaginator,
    DatePipe,
  ],
})
export class ManageForumComponent implements OnInit {
  protected loading = signal(true);
  protected posts = signal<any>(null);
  protected skip = 0;
  protected limit = signal(10);
  protected count = signal(0);
  protected page = signal(1);

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.posts.set(null);
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit();
      this.page.set(page);

      this.loadPosts();
    });
  }

  loadPosts() {
    this.posts.set(null);
    this.loading.set(true);
    this.adminService
      .fetch_forum({ limit: this.limit(), skip: this.skip })
      .then((records: any) => {
        this.posts.set(records.posts);
        this.skip = records.skip;
        this.limit.set(records.limit);
        this.count.set(records.count);
        this.loading.set(false);
      })
      .catch(() => {
        this.loading.set(false);
      });
  }

  changePage(event: any) {
    this.posts.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + event.pageIndex,
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }

  delete(id: string) {
    const modal = this.dialog.open(AdminActionConfirmModalComponent, {
      data: { message: `Are you sure you want to delete the forum post?.` },
    });

    modal.afterClosed().subscribe((ok) => {
      if (ok) {
        this.adminService
          .delete_forum(id)
          .then(() => {
            this.loadPosts();
            this.toastr.success('Forum item deleted successfully', 'Success');
          })
          .catch(() => {
            this.toastr.error('Request failed. Try again later!', 'Error');
          });
      }
    });
  }
}
