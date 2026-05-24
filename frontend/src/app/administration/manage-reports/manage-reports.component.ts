import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
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
  selector: 'app-manage-reports',
  templateUrl: './manage-reports.component.html',
  styleUrls: ['./manage-reports.component.css'],
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
export class ManageReportsComponent implements OnInit {
  public loading = signal(true);
  public posts = signal<any>(null);
  public skip = 0;
  public limit = signal(10);
  public count = signal(0);
  public page = signal(1);
  public _ = _;

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
      .fetch_reports({ limit: this.limit(), skip: this.skip })
      .then((records: any) => {
        const posts = _.map(records.reports, (post: any) => {
          if (post.type === 'report_selling_ad') {
            _.assign(post, { link: '/market/' + post.targetId + '/view' });
          }

          return post;
        });
        this.posts.set(posts);
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

  resolveReport(reportId: string) {
    this.adminService.resolve_report(reportId).then(() => {
      this.toastr.success('Resolved successfully', 'Success');
      this.loadPosts();
    });
  }
}
