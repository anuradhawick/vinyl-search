import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { AngularFireFunctions } from '@angular/fire/functions';
import * as _ from 'lodash';
import { RecordsService } from '../../services/records.service';

@Component({
  selector: 'app-record-view-page',
  templateUrl: './record-view-page.component.html',
  styleUrls: ['./record-view-page.component.css']
})
export class RecordViewPageComponent implements OnInit {
  @ViewChild('releasepageloader') loader: LoaderComponent;
  public _ = _;
  public recordObject = null;
  public imgvconfig = {
    btnClass: 'default',
    zoomFactor: 0.1,
    containerBackgroundColor: '#ccc',
    wheelZoom: false,
    allowFullscreen: true,
    allowKeyboardNavigation: true,
    btnIcons: {
      next: 'fas fa-angle-double-right',
      prev: 'fas fa-angle-double-left',
      fullscreen: 'fas fa-arrows-alt',
    },
    btnShow: {
      next: true,
      prev: true
    }
  };

  constructor(public route: ActivatedRoute, private recordsService: RecordsService) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      this.loader.show();

      const recordId = _.get(map, 'params.recordId', null);
      const data = this.recordsService.fetch_record(recordId);
      this.recordObject = data;

      data.subscribe((d) => {
        this.loader.hide();
      }, () => {
        console.log('error');
      });
    });
  }

}
