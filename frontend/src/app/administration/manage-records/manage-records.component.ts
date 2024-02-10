import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../services/admin.service';
import * as _ from 'lodash';
import { AdminActionConfirmModalComponent } from '../modals/admin-action-confirm-modal/admin-action-confirm-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-records',
  templateUrl: './manage-records.component.html',
  styleUrls: ['./manage-records.component.css'],
})
export class ManageRecordsComponent implements OnInit {
  public loading: boolean = true;
  public records: any = null;
  public skip = 0;
  public limit = 10;
  public count = 0;
  public page = 1;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.records = null;
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit;
      this.page = page;
      this.loadPosts();
    });
  }

  loadPosts() {
    this.records = null;
    this.loading = true;
    this.adminService
      .fetch_records({ limit: this.limit, skip: this.skip })
      .then((records: any) => {
        this.records = records.records;
        this.skip = records.skip;
        this.limit = records.limit;
        this.count = records.count;
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
  }

  changePage(event: any) {
    this.records = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + event.pageIndex,
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }

  delete(id: any) {
    const modal = this.dialog.open(AdminActionConfirmModalComponent, {
      data: {
        message: `Are you sure you want to delete the record entry?. All its previous version will be deleted as well.`,
      },
    });

    modal.afterClosed().subscribe((ok) => {
      if (ok) {
        this.adminService
          .delete_record(id)
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
