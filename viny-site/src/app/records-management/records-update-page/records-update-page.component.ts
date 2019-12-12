import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordsService } from '../../services/records.service';
import { AuthService } from '../../shared-modules/auth/auth.service';
import { RecordsEditorComponentComponent } from '../records-editor-component/records-editor-component.component';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-records-update-page',
  templateUrl: './records-update-page.component.html',
  styleUrls: ['./records-update-page.component.css']
})
export class RecordsUpdatePageComponent implements OnInit {
  @ViewChild('editor', {static: false}) editor: RecordsEditorComponentComponent;

  public _ = _;
  public recordObject = null;
  public ready = true;
  public revisionComments = null;

  constructor(public route: ActivatedRoute,
              private recordsService: RecordsService,
              public auth: AuthService,
              private router: Router,
              private toastr: ToastrService) {
  }

  ngOnInit() {
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
    const form: any = document.getElementsByClassName('validate-comment')[0];
    const valid = form.checkValidity();

    form.classList.add('was-validated');
    _.assign(record, {
      revisionComments: this.revisionComments
    });

    if (!valid || !record) {
      this.toastr.error(`Please fill the required fields`, 'Error');
    }

    if (record && valid) {
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

  readyChange(event) {
    this.ready = event;
  }

}
