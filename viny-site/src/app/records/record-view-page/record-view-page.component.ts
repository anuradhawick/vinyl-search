import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { AngularFireFunctions } from '@angular/fire/functions';
import * as _ from 'lodash';

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

  constructor(public route: ActivatedRoute, private fns: AngularFireFunctions) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      const recordId = _.get(map, 'params.recordId', null);
      this.loader.show();
      const callable = this.fns.httpsCallable('fetch_record');
      const data = callable({id: recordId});
      this.recordObject = data;
      data.subscribe((record) => {
        this.loader.hide();
      }, () => {
        console.log('error');
      });
    });
  }

}
