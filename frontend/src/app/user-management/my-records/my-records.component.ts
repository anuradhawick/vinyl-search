import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { UserService } from '../../shared-modules/services/user.service';
import * as _ from 'lodash';
import { RecordShouldDeleteModalComponent } from '../modals/record-should-delete-modal/record-should-delete-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-records',
  templateUrl: './my-records.component.html',
  styleUrls: ['./my-records.component.css'],
})
export class MyRecordsComponent implements OnInit {
  @ViewChild('loader', { static: true }) loader!: LoaderComponent;
  public records: any = null;
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
      this.records = null;
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
      .get_records({ limit: this.limit, skip: this.skip })
      .then((records: any) => {
        this.records = records.records;
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
    this.records = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + event.pageIndex,
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }

  delete(id: string) {
    const modal = this.dialog.open(RecordShouldDeleteModalComponent);

    modal.afterClosed().subscribe((ok) => {
      if (ok) {
        this.userService
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
