import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordsEditorComponentComponent } from '../records-editor-component/records-editor-component.component';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { RecordsService } from '../services/records.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { CatalogErrorModalComponent } from '../modals/catalog-error/catalog-error.component';
import { catchError, of } from 'rxjs';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
// import { record } from './test-record';

@Component({
  selector: 'app-records-edit-page',
  templateUrl: './records-edit-page.component.html',
  styleUrls: ['./records-edit-page.component.scss'],
})
export class RecordsEditPageComponent implements OnInit {
  @ViewChild('editor') editor!: RecordsEditorComponentComponent;

  protected ready = true;
  protected loading = true;
  protected isRevisionSubmission = false;
  protected record: any = null;
  protected revisionComments: FormControl;
  // For testing
  // protected record = record;

  constructor(
    private route: ActivatedRoute,
    private recordsService: RecordsService,
    private router: Router,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private fb: FormBuilder,
  ) {
    this.revisionComments = this.fb.control('', Validators.required);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((map: any) => {
      const recordId = _.get(map, 'params.recordId', null);
      this.isRevisionSubmission = !!recordId;

      if (this.isRevisionSubmission) {
        this.recordsService.fetch_record(recordId).subscribe((record) => {
          this.record = record;
          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    });
  }

  save() {
    const record = this.editor.getReleaseData();

    if (
      (this.isRevisionSubmission && !this.revisionComments.valid) ||
      !record
    ) {
      this.revisionComments.markAllAsTouched();
      this.toastr.error(`Please fill the required fields`, 'Error');
      return;
    }

    if (this.isRevisionSubmission && this.revisionComments.valid) {
      _.assign(record, {
        revisionComments: this.revisionComments.value,
      });
    }

    this.loading = true;
    this.ready = false;
    this.record = record;

    (this.isRevisionSubmission
      ? this.recordsService.update_record(record)
      : this.recordsService.save_record(record)
    )
      .pipe(
        catchError((error) => {
          console.log(error);
          this.ready = true;
          this.toastr.error(
            `Unable to save the records. Try again later`,
            'Error',
          );
          return of(null);
        }),
      )
      .subscribe((result: any) => {
        if (result.recordId) {
          this.toastr.success(`Records saved successfully`, 'Success');
          this.router.navigate([
            '/records',
            result.recordId,
            'view',
            { reload: true },
          ]);
        } else {
          this.ready = true;
          this.dialog.open(CatalogErrorModalComponent, {
            data: { id: result.originalId },
          });
        }
        this.loading = false;
      });
  }

  readyChange(event: any) {
    this.ready = event;
  }
}
