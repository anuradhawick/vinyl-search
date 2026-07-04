import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../shared/services/user.service';
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
  selector: 'app-my-market',
  templateUrl: './my-market.component.html',
  styleUrls: ['./my-market.component.css'],
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
export class MyMarketComponent implements OnInit {
  @ViewChild('loader', { static: true }) loader!: LoaderComponent;
  public posts = signal<any>(null);
  public skip = 0;
  public limit = signal(10);
  public count = signal(0);
  public page = signal(1);
  public _ = _;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    // private marketService: ForumService,
    private toastr: ToastrService,
    // private dialog: MatDialog
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
      .get_market_posts({ limit: this.limit(), skip: this.skip })
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

  markAsSold(id: string) {
    this.userService.mark_selling_item_sold(id).then(() => {
      this.loadPosts();
      this.toastr.success('Item marked as sold successfully', 'Success');
    });
    // const modal = this.dialog.open(ForumShouldDeleteModalComponent);
    //
    // modal.afterClosed().subscribe((ok) => {
    //   if (ok) {
    //     this.forumService.delete_post(id).then(() => {
    //       this.loadPosts();
    //       this.toastr.success('Forum item deleted successfully', 'Success');
    //     }).catch(() => {
    //       this.toastr.error('Request failed. Try again later!', 'Error');
    //     });
    //   }
    // });
  }

  delete(id: string) {
    // const modal = this.dialog.open(ForumShouldDeleteModalComponent);
    //
    // modal.afterClosed().subscribe((ok) => {
    //   if (ok) {
    //     this.forumService.delete_post(id).then(() => {
    //       this.loadPosts();
    //       this.toastr.success('Forum item deleted successfully', 'Success');
    //     }).catch(() => {
    //       this.toastr.error('Request failed. Try again later!', 'Error');
    //     });
    //   }
    // });
  }
}
