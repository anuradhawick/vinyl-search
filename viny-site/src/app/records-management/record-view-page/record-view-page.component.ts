import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import * as _ from 'lodash';
import { RecordsService } from '../../services/records.service';
import { AuthService } from '../../shared-modules/auth/auth.service';

@Component({
  selector: 'app-record-view-page',
  templateUrl: './record-view-page.component.html',
  styleUrls: ['./record-view-page.component.css']
})
export class RecordViewPageComponent implements OnInit {
  public _ = _;
  public recordObject = null;
  public recordHistory = null;
  public imgvconfig = {
    zoomFactor: 0.1,
    wheelZoom: false,
    allowFullscreen: true,
    allowKeyboardNavigation: true,
    customBtns: [],
    btnShow: {
      next: true,
      prev: true,
      zoomIn: true,
      zoomOut: true
    }
  };

  // context control
  public histLoading = true;
  public recordLoading = true;

  constructor(public route: ActivatedRoute,
              private recordsService: RecordsService,
              public auth: AuthService) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      const recordId = _.get(map, 'params.recordId', null);
      this.recordsService.fetch_record(recordId).then((data) => {
        this.recordObject = data;
        this.recordLoading = false;
        this.recordsService.fetch_record_history(recordId).then((data1) => {
          this.recordHistory = data1;
          this.histLoading = false;
        });
      });
    });
  }

}
