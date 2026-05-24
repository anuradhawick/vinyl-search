import { Component, OnInit, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarketService } from '../../services/market.service';
import * as _ from 'lodash';
import { LoaderComponent } from '../../../shared-modules/loader/loader.component';
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
  selector: 'app-expired-ads',
  templateUrl: './expired-ads.component.html',
  styleUrls: ['./expired-ads.component.css'],
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
export class ExpiredAdsComponent implements OnInit {
  public loading = signal(true);
  public posts = signal<any>(null);
  public skip = 0;
  public limit = signal(10);
  public count = signal(0);
  public page = signal(1);

  constructor(
    private route: ActivatedRoute,
    private adminMarketService: MarketService,
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
    this.adminMarketService
      .fetch_posts_by_type({
        limit: this.limit(),
        skip: this.skip,
        type: 'rejected-expired',
      })
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
}
