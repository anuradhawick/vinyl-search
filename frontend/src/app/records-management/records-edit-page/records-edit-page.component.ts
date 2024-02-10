import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RecordsEditorComponentComponent } from '../records-editor-component/records-editor-component.component';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { RecordsService } from '../services/records.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { CatalogErrorModalComponent } from '../modals/catalog-error/catalog-error.component';
// import { record } from './test-record';

@Component({
  selector: 'app-records-edit-page',
  templateUrl: './records-edit-page.component.html',
  styleUrls: ['./records-edit-page.component.css'],
})
export class RecordsEditPageComponent {
  @ViewChild('editor') editor!: RecordsEditorComponentComponent;
  @ViewChild('loader') loader!: LoaderComponent;

  protected ready = true;
  protected record = null;
  // For testing
  // protected record = record;

  constructor(
    private recordsService: RecordsService,
    private router: Router,
    private toastr: ToastrService,
    public dialog: MatDialog,
  ) {}

  save() {
    const record = this.editor.getReleaseData();

    if (!record) return;

    this.loader.show();
    this.ready = false;
    this.record = record;

    const data = this.recordsService.save_record(record);

    data.then(
      (result: any) => {
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
          this.loader.hide();
          this.dialog.open(CatalogErrorModalComponent, {
            data: { id: result.originalId },
          });
        }
      },
      () => {
        this.ready = true;
        this.loader.hide();
        this.toastr.error(
          `Unable to save the records. Try again later`,
          'Error',
        );
      },
    );
  }

  readyChange(event: any) {
    this.ready = event;
  }
}
