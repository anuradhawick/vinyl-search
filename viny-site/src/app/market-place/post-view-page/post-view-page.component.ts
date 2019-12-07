import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarketService } from '../../services/market.service';
import { AuthService } from '../../shared-modules/auth/auth.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-post-view-page',
  templateUrl: './post-view-page.component.html',
  styleUrls: ['./post-view-page.component.css']
})
export class PostViewPageComponent implements OnInit {
  public _ = _;
  public postObject = null;
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

  public typeMap = {
    'material': 'A/V Material',
    'gear': 'A/V Gear'
  };

  public subTypeMap = {
    'material': {
      'phonograph': 'Phonograph Records',
      'magnetic': 'Magnetic Tapes',
      'compact': 'Compact Discs',
      'digital': 'Digital Material',
      'other': 'Other'
    },
    'gear': {
      'amplifiers': 'Amplifiers',
      'pre-amplifiers': 'Pre Amplifiers',
      'speakers': 'Speakers',
      'equalizers': 'Equalizers',
      'mixers': 'Mixers',
      'tape': 'Tape Gear',
      'vinyl': 'Vinyl Gear',
      'audio': 'Audio Accessories',
      'video': 'Video Gear',
      'digital': 'Digital Gear',
      'other': 'Other'
    }
  };

  constructor(public route: ActivatedRoute,
              private marketService: MarketService,
              public auth: AuthService) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      const postId = _.get(map, 'params.postId', null);
      this.postObject = this.marketService.fetch_post(postId);
    });
  }

}
