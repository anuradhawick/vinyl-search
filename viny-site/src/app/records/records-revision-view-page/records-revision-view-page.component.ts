import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { RecordsService } from '../../services/records.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-records-revision-view-page',
  templateUrl: './records-revision-view-page.component.html',
  styleUrls: ['./records-revision-view-page.component.css']
})
export class RecordsRevisionViewPageComponent implements OnInit {
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


  constructor(private route: ActivatedRoute,
              private recordsService: RecordsService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      this.loader.show();

      const recordId = _.get(map, 'params.recordId', null);
      const revisionId = _.get(map, 'params.revisionId', null);
      const data = this.recordsService.fetch_record_revision(recordId, revisionId);
      this.recordObject = data;

      data.subscribe((d) => {
        console.log(d)
        this.loader.hide();
      }, () => {
        console.log('error');
      });
    });
  }

}
