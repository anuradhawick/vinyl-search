import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../services/admin.service';
import * as _ from 'lodash';
import { AdminActionConfirmModalComponent } from '../modals/admin-action-confirm-modal/admin-action-confirm-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
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

@Component({
  selector: 'app-manage-records',
  templateUrl: './manage-records.component.html',
  styleUrls: ['./manage-records.component.css'],
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
  ],
})
export class ManageRecordsComponent implements OnInit {
  public loading = signal(true);
  public records = signal<any>(null);
  public skip = 0;
  public limit = signal(10);
  public count = signal(0);
  public page = signal(1);

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.records.set(null);
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit();
      this.page.set(page);
      this.loadPosts();
    });
  }

  loadPosts() {
    this.records.set(null);
    this.loading.set(true);
    this.adminService
      .fetch_records({ limit: this.limit(), skip: this.skip })
      .then((records: any) => {
        this.records.set(records.records);
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
    this.records.set(null);
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
