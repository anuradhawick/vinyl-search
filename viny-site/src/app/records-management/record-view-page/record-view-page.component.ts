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
    btnClass: 'default',
    zoomFactor: 0.1,
    containerBackgroundColor: '#ccc',
    wheelZoom: false,
    allowFullscreen: true,
    allowKeyboardNavigation: true,
    btnIcons: {
      zoomIn: 'fas fa-plus',
      zoomOut: 'fas fa-minus',
      next: 'fas fa-angle-double-right',
      prev: 'fas fa-angle-double-left',
      fullscreen: 'fas fa-arrows-alt',
    },
    customBtns: [],
    btnShow: {
      next: true,
      prev: true,
      zoomIn: true,
      zoomOut: true
    }
  };

  constructor(public route: ActivatedRoute,
              private recordsService: RecordsService,
              public auth: AuthService) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      const recordId = _.get(map, 'params.recordId', null);
      this.recordObject = this.recordsService.fetch_record(recordId);
      this.recordHistory = this.recordsService.fetch_record_history(recordId);
    });
  }

}
