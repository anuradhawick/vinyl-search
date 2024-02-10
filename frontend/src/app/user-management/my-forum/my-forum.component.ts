import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared-modules/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ForumShouldDeleteModalComponent } from '../modals/forum-should-delete/forum-should-delete.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-my-forum',
  templateUrl: './my-forum.component.html',
  styleUrls: ['./my-forum.component.css'],
})
export class MyForumComponent implements OnInit {
  @ViewChild('loader', { static: true }) loader!: LoaderComponent;
  public posts: any = null;
  public skip = 0;
  public limit = 10;
  public count = 0;
  public page = 1;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService,
    @Inject(MatDialog) private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.posts = null;
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit;
      this.page = page;
      this.loader.show();

      this.loadPosts();
    });
  }

  loadPosts() {
    this.loader.show();
    this.userService
      .get_forum_posts({ limit: this.limit, skip: this.skip })
      .then((records: any) => {
        this.posts = records.posts;
        this.skip = records.skip;
        this.limit = records.limit;
        this.count = records.count;
        this.loader.hide();
      })
      .catch(() => {
        this.loader.hide();
      });
  }

  changePage(event: any) {
    this.posts = null;
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
