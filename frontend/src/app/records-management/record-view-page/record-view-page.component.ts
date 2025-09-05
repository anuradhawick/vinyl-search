import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import * as _ from 'lodash';
import { RecordsService } from '../services/records.service';
import { AuthService } from '../../shared-modules/services/auth.service';

@Component({
  selector: 'app-record-view-page',
  templateUrl: './record-view-page.component.html',
  styleUrls: ['./record-view-page.component.scss'],
})
export class RecordViewPageComponent implements OnInit {
  protected _ = _;
  protected recordObject: any = null;
  protected recordHistory: any = null;
  protected imgvconfig: any = {
    zoomFactor: 0.1,
    wheelZoom: true,
    allowFullscreen: true,
    allowKeyboardNavigation: true,
    customBtns: [],
    btnShow: {
      next: true,
      prev: true,
      zoomIn: true,
      zoomOut: true,
    },
  };

  // context control
  protected histLoading = true;
  protected recordLoading = true;
  protected isRevisionView = false;

  constructor(
    protected auth: AuthService,
    private route: ActivatedRoute,
    private recordsService: RecordsService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      const recordId = _.get(map, 'params.recordId', null);
      const revisionId = _.get(map, 'params.revisionId', null);
      this.isRevisionView = !!revisionId;
      // fetch records
      (this.isRevisionView
        ? this.recordsService.fetch_record_revision(recordId, revisionId)
        : this.recordsService.fetch_record(recordId)
      ).subscribe((data: any) => {
        this.recordObject = data.record;
        this.recordLoading = false;
      });
      // fetch revisions
      !this.isRevisionView &&
        this.recordsService
          .fetch_record_history(recordId)
          .subscribe((data: any) => {
            this.recordHistory = data.history;
            this.histLoading = false;
          });
    });
  }
}
