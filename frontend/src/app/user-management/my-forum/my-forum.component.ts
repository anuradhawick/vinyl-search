import { Component, Inject, OnInit, signal, ViewChild } from '@angular/core';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ForumShouldDeleteModalComponent } from '../modals/forum-should-delete/forum-should-delete.component';
import * as _ from 'lodash';
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
  selector: 'app-my-forum',
  templateUrl: './my-forum.component.html',
  styleUrls: ['./my-forum.component.css'],
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
export class MyForumComponent implements OnInit {
  @ViewChild('loader', { static: true }) loader!: LoaderComponent;
  public posts = signal<any>(null);
  public skip = 0;
  public limit = signal(10);
  public count = signal(0);
  public page = signal(1);

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService,
    @Inject(MatDialog) private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.posts.set(null);
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit();
      this.page.set(page);
      this.loader.show();

      this.loadPosts();
    });
  }

  loadPosts() {
    this.loader.show();
    this.userService
      .get_forum_posts({ limit: this.limit(), skip: this.skip })
      .then((records: any) => {
        this.posts.set(records.posts);
        this.skip = records.skip;
        this.limit.set(records.limit);
        this.count.set(records.count);
        this.loader.hide();
      })
      .catch(() => {
        this.loader.hide();
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
    const modal = this.dialog.open(ForumShouldDeleteModalComponent);

    modal.afterClosed().subscribe((ok) => {
      if (ok) {
        this.userService
          .delete_forum_post(id)
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
