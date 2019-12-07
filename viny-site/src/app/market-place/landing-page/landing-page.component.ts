import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { AuthService } from '../../shared-modules/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material';
import { MarketService } from '../../services/market.service';

interface TreeNode {
  name: string;
  saleType?: string;
  saleSubtype?: string;
  selected?: boolean;
  children?: TreeNode[];
}

const TREE_DATA: TreeNode[] = [
  {
    name: 'A/V Material',
    children: [
      {name: 'Phonograph Records', saleType: 'material', saleSubtype: 'phonograph'},
      {name: 'Magnetic Records', saleType: 'material', saleSubtype: 'magnetic'},
      {name: 'Compact Discs', saleType: 'material', saleSubtype: 'compact'},
      {name: 'Digital Material', saleType: 'material', saleSubtype: 'digital'},
      {name: 'Other', saleType: 'material', saleSubtype: ''}
    ]
  }, {
    name: 'A/V Gear',
    children: [
      {name: 'Amplifiers', saleType: 'gear', saleSubtype: 'amplifiers'},
      {name: 'Pre Amplifiers', saleType: 'gear', saleSubtype: 'pre-amplifiers'},
      {name: 'Speakers', saleType: 'gear', saleSubtype: 'speakers'},
      {name: 'Equalizers', saleType: 'gear', saleSubtype: 'equalizers'},
      {name: 'Mixers', saleType: 'gear', saleSubtype: 'mixers'},
      {name: 'Tape Gear', saleType: 'gear', saleSubtype: 'tape'},
      {name: 'Vinyl Gear', saleType: 'gear', saleSubtype: 'vinyl'},
      {name: 'Audio Accessories', saleType: 'gear', saleSubtype: 'audio'},
      {name: 'Video Gear', saleType: 'gear', saleSubtype: 'video'},
      {name: 'Digital Gear', saleType: 'gear', saleSubtype: 'digital'},
      {name: 'Other', saleType: 'gear', saleSubtype: 'other'},
    ]
  }
];

/** Flat node with expandable and level information */
interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  public records = null;
  public skip = 0;
  public limit = 30;
  public count = 0;
  public page = 1;
  public autocomplete = null;
  public _ = _;
  public query = null;

  // page filters
  public materialFilters = [];
  public gearFilters = [];

  // context control
  selectedFilters = {};

  @ViewChild('loader', {static: true}) loader: LoaderComponent;

  public treeControl = new FlatTreeControl<FlatNode>(
    node => node.level, node => node.expandable);

  public treeFlattener = new MatTreeFlattener(
    (node: TreeNode, level: number) => {
      return {
        expandable: !!node.children && node.children.length > 0,
        name: node.name,
        selected: node.selected,
        saleType: node.saleType,
        saleSubtype: node.saleSubtype,
        level: level,
      };
    }, node => node.level, node => node.expandable, node => node.children);

  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private marketService: MarketService,
              public route: ActivatedRoute,
              private router: Router,
              public auth: AuthService) {
    this.dataSource.data = TREE_DATA;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.records = null;
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit;
      this.page = page;
      this.loader.show();
      this.query = _.get(p, 'query', '');
      this.gearFilters = _.get(p, 'gear', []);
      this.materialFilters = _.get(p, 'material', []);
      this.selectedFilters = {};

      if (!Array.isArray(this.gearFilters)) {
        this.gearFilters = [this.gearFilters];
      }
      if (!Array.isArray(this.materialFilters)) {
        this.materialFilters = [this.materialFilters];
      }
      _.each(this.materialFilters, (f) => {
        this.selectedFilters[`material.${f}`] =  true;
      });

      _.each(this.gearFilters, (f) => {
        this.selectedFilters[`gear.${f}`] =  true;
      });

      if (_.isEmpty(_.trim(this.query)) &&
        _.isEmpty(this.materialFilters) &&
        _.isEmpty(this.gearFilters)) {
        this.loadRecords();
      } else {
        this.loadSearchPage();
      }
    });
  }

  loadAutoComplete(event) {
    const query: string = _.trim(event.target.value);
    let newquery = '';

    if (_.isEmpty(query) || query.length < 3) {
      this.autocomplete = null;
      return;
    } else {
      const qarray = _.split(query, ' ');

      _.each(qarray, (item) => {
        const tmp: string = _.trim(item);

        if (tmp.length >= 3) {
          newquery += tmp;
          newquery += ' ';
        }
      });
    }

    this.autocomplete = this.marketService.search_posts({limit: 5, skip: 0, query: _.trim(newquery)});
  }

  exitSearch() {
    setTimeout(() => {
      this.autocomplete = null;
    }, 500);
  }

  search() {
    const query = _.trim(this.query);
    if (_.isEmpty(query)) {
      this.autocomplete = null;
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        query,
        page: 1
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }

  loadRecords() {
    const data = this.marketService.fetch_posts({
      skip: this.skip,
      limit: this.limit
    });

    this.records = data;

    data.subscribe((records: any) => {
      this.skip = records.skip;
      this.limit = records.limit;
      this.count = _.get(records, 'count', 0);
      this.loader.hide();
    });
  }

  loadSearchPage() {
    this.records = null;
    const data = this.marketService.search_posts({
      limit: this.limit,
      skip: this.skip,
      query: this.query,
      gear: JSON.stringify(this.gearFilters),
      material: JSON.stringify(this.materialFilters)
    });

    this.records = data;

    data.subscribe((postsList: any) => {
      this.skip = postsList.skip;
      this.limit = postsList.limit;
      this.count = postsList.count;
      this.loader.hide();
    });
  }

  toggleFilter(type, subType) {
    if (type === 'material') {
      if (_.find(this.materialFilters, (i) => i === subType)) {
        _.remove(this.materialFilters, (i) => i === subType);
      } else {
        this.materialFilters.push(subType);
      }
    } else {
      if (_.find(this.gearFilters, (i) => i === subType)) {
        _.remove(this.gearFilters, (i) => i === subType);
      } else {
        this.gearFilters.push(subType);
      }
    }
    this.selectedFilters[`${type}.${subType}`] = !this.selectedFilters[`${type}.${subType}`];
    this.activateFilters();
  }

  activateFilters() {
    const queryParams = {
      query: _.isEmpty(this.query) ? null : this.query,
      material: _.isEmpty(this.materialFilters) ? null : this.materialFilters,
      gear: _.isEmpty(this.gearFilters) ? null : this.gearFilters
    };

    this.router.navigateByUrl(this.router.url.split(/[?#]/)[0]).then(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams
      });
    });
  }

  changePage(event) {
    this.records = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + event.pageIndex
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }


  hasChild = (_: number, node: FlatNode) => node.expandable;
}
