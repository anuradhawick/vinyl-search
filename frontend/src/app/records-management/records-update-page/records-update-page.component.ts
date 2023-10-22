import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordsService } from '../services/records.service';
import { AuthService } from '../../shared-modules/services/auth.service';
import { RecordsEditorComponentComponent } from '../records-editor-component/records-editor-component.component';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-records-update-page',
  templateUrl: './records-update-page.component.html',
  styleUrls: ['./records-update-page.component.css']
})
export class RecordsUpdatePageComponent implements OnInit {
  @ViewChild(RecordsEditorComponentComponent)
  editor!: RecordsEditorComponentComponent;

  public _ = _;
  public recordObject: any = null;
  public ready: boolean = true;
  public revisionComments!: FormControl;

  constructor(
    public route: ActivatedRoute,
    private recordsService: RecordsService,
    public auth: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.revisionComments = this.fb.control('', Validators.required)
    this.route.paramMap.subscribe((map: any) => {
      const recordId = _.get(map, 'params.recordId', null);
      const data = this.recordsService.fetch_record(recordId);

      data.then((record) => {
        this.recordObject = record;
      }, () => {
        console.log('error');
      });
    });
  }

  save() {
    const record = this.editor.getReleaseData();

    if (!this.revisionComments.valid || !record) {
      this.revisionComments.markAllAsTouched();
      this.toastr.error(`Please fill the required fields`, 'Error');
      return;
    }

    if (record && this.revisionComments.valid) {
      _.assign(record, {
        revisionComments: this.revisionComments.value
      });
  
      this.ready = false;
      const data = this.recordsService.update_record(record);

      data.then((result: any) => {
        this.router.navigate(['/records', result.recordId, 'view']);
      }, () => {
        this.ready = true;
        this.toastr.error(`Unable to submit revision. Try again later`, 'Error');
      });
    }
  }

  readyChange(event: any) {
    this.ready = event;
  }

}
