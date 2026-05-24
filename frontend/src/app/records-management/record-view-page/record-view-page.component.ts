import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import * as _ from 'lodash';
import { RecordsService } from '../services/records.service';
import { AuthService } from '../../shared-modules/services/auth.service';
import { ImageViewerComponent } from '../../shared-modules/image-viewer/image-viewer.component';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatChipListbox, MatChip } from '@angular/material/chips';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-record-view-page',
  templateUrl: './record-view-page.component.html',
  styleUrls: ['./record-view-page.component.scss'],
  imports: [
    LoaderComponent,
    ImageViewerComponent,
    MatCard,
    MatCardContent,
    MatChipListbox,
    MatChip,
    MatButton,
    RouterLink,
    MatFabButton,
    MatIcon,
    DatePipe,
  ],
})
export class RecordViewPageComponent implements OnInit {
  protected _ = _;
  protected recordObject = signal<any>(null);
  protected recordHistory = signal<any>(null);
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
  protected histLoading = signal(true);
  protected recordLoading = signal(true);
  protected isRevisionView = signal(false);

  constructor(
    protected auth: AuthService,
    private route: ActivatedRoute,
    private recordsService: RecordsService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      const recordId = _.get(map, 'params.recordId', null);
      const revisionId = _.get(map, 'params.revisionId', null);
      this.isRevisionView.set(!!revisionId);
      // fetch records
      (this.isRevisionView()
        ? this.recordsService.fetch_record_revision(recordId, revisionId)
        : this.recordsService.fetch_record(recordId)
      ).subscribe((data: any) => {
        this.recordObject.set(data.record);
        this.recordLoading.set(false);
      });
      // fetch revisions
      !this.isRevisionView() &&
        this.recordsService
          .fetch_record_history(recordId)
          .subscribe((data: any) => {
            this.recordHistory.set(data.history);
            this.histLoading.set(false);
          });
    });
  }
}
