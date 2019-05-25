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

  constructor(private route: ActivatedRoute, private fns: AngularFireFunctions) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      const recordId = _.get(map, 'params.recordId', null);
      console.log(recordId);
      this.loader.show();
      const callable = this.fns.httpsCallable('fetch_record');
      const data = callable({id: recordId});
      data.subscribe((post) => {
        console.log(post)
      }, () => {
        console.log("error");
      });
    });
  }

}
