import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';

@Component({
  selector: 'app-manage-reports',
  templateUrl: './manage-reports.component.html',
  styleUrls: ['./manage-reports.component.css']
})
export class ManageReportsComponent implements OnInit {
  public loading = true;
  public posts: any = null;
  public skip = 0;
  public limit = 10;
  public count = 0;
  public page = 1;
  public _ = _;

  constructor(private route: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.posts = null;
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit;
      this.page = page;

      this.loadPosts();
    });
  }

  loadPosts() {
    this.posts = null;
    this.loading = true;
    this.adminService.fetch_reports({ limit: this.limit, skip: this.skip }).then((records: any) => {
      this.posts = records.reports;
      this.posts = _.map(this.posts, (post: any) => {
        if (post.type === 'report_selling_ad') {
          _.assign(post, { link: '/market/' + post.targetId + '/view' });
        }

        return post;
      });
      this.skip = records.skip;
      this.limit = records.limit;
      this.count = records.count;
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }

  changePage(event: any) {
    this.posts = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + event.pageIndex
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
