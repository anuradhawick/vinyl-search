import { Component, OnInit, signal, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { AuthService } from '../../shared-modules/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTree,
  MatTreeNodeDef,
  MatTreeNode,
  MatTreeNodeToggle,
} from '@angular/material/tree';
import { MarketService } from '../services/market.service';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { AsyncPipe } from '@angular/common';

interface TreeNode {
  name: string;
  saleType: string;
  saleSubtype: string;
  selected: boolean;
  children?: TreeNode[];
}

const TREE_DATA: TreeNode[] = [
  {
    name: 'A/V Material',
    saleType: '',
    saleSubtype: '',
    selected: false,
    children: [
      {
        name: 'Phonograph Records',
        selected: false,
        saleType: 'material',
        saleSubtype: 'phonograph',
      },
      {
        name: 'Magnetic Records',
        selected: false,
        saleType: 'material',
        saleSubtype: 'magnetic',
      },
      {
        name: 'Compact Discs',
        selected: false,
        saleType: 'material',
        saleSubtype: 'compact',
      },
      {
        name: 'Digital Material',
        selected: false,
        saleType: 'material',
        saleSubtype: 'digital',
      },
      {
        name: 'Other',
        selected: false,
        saleType: 'material',
        saleSubtype: 'other',
      },
    ],
  },
  {
    name: 'A/V Gear',
    saleType: '',
    saleSubtype: '',
    selected: false,
    children: [
      {
        name: 'Amplifiers',
        selected: false,
        saleType: 'gear',
        saleSubtype: 'amplifiers',
      },
      {
        name: 'Pre Amplifiers',
        selected: false,
        saleType: 'gear',
        saleSubtype: 'pre-amplifiers',
      },
      {
        name: 'Speakers',
        selected: false,
        saleType: 'gear',
        saleSubtype: 'speakers',
      },
      {
        name: 'Equalizers',
        selected: false,
        saleType: 'gear',
        saleSubtype: 'equalizers',
      },
      {
        name: 'Mixers',
        selected: false,
        saleType: 'gear',
        saleSubtype: 'mixers',
      },
      {
        name: 'Tape Gear',
        selected: false,
        saleType: 'gear',
        saleSubtype: 'tape',
      },
      {
        name: 'Vinyl Gear',
        selected: false,
        saleType: 'gear',
        saleSubtype: 'vinyl',
      },
      {
        name: 'Audio Accessories',
        selected: false,
        saleType: 'gear',
        saleSubtype: 'audio',
      },
      {
        name: 'Video Gear',
        selected: false,
        saleType: 'gear',
        saleSubtype: 'video',
      },
      {
        name: 'Digital Gear',
        selected: false,
        saleType: 'gear',
        saleSubtype: 'digital',
      },
      {
        name: 'Other',
        selected: false,
        saleType: 'gear',
        saleSubtype: 'other',
      },
    ],
  },
];

/** Flat node with expandable and level information */
interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  saleType: string;
  saleSubtype: string;
  selected: boolean;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  imports: [
    FormsModule,
    MatButton,
    RouterLink,
    MatTree,
    MatTreeNodeDef,
    MatTreeNode,
    MatIcon,
    MatTreeNodeToggle,
    LoaderComponent,
    MatPaginator,
    AsyncPipe,
  ],
})
export class LandingPageComponent implements OnInit {
  public records = signal<any>(null);
  public skip = 0;
  public limit = signal(30);
  public count = signal(0);
  public page = signal(1);
  public autocomplete = signal<any>(null);
  public _ = _;
  public query = signal('');

  // page filters
  public materialFilters = signal<any[]>([]);
  public gearFilters = signal<any[]>([]);

  // context control
  selectedFilters = signal<Record<string, boolean>>({});

  @ViewChild('loader', { static: true }) loader!: LoaderComponent;

  public treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

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
    },
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  public dataSource = new MatTreeFlatDataSource(
    this.treeControl,
    this.treeFlattener,
  );

  constructor(
    private marketService: MarketService,
    public route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
  ) {
    this.dataSource.data = TREE_DATA;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.records.set(null);
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit();
      this.page.set(page);
      this.loader.show();
      this.query.set(_.get(p, 'query', ''));
      this.gearFilters.set(this.ensureArray(_.get(p, 'gear', [])));
      this.materialFilters.set(this.ensureArray(_.get(p, 'material', [])));

      const selectedFilters: Record<string, boolean> = {};
      _.each(this.materialFilters(), (f) => {
        selectedFilters[`material.${f}`] = true;
      });

      _.each(this.gearFilters(), (f) => {
        selectedFilters[`gear.${f}`] = true;
      });
      this.selectedFilters.set(selectedFilters);

      if (
        _.isEmpty(_.trim(this.query())) &&
        _.isEmpty(this.materialFilters()) &&
        _.isEmpty(this.gearFilters())
      ) {
        this.loadRecords();
      } else {
        this.loadSearchPage();
      }
    });
  }

  loadAutoComplete(event: any) {
    const query: string = _.trim(event.target.value);
    let newquery = '';

    if (_.isEmpty(query) || query.length < 3) {
      this.autocomplete.set(null);
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

    this.marketService
      .search_posts({
        limit: 5,
        skip: 0,
        query: _.trim(newquery),
      })
      .subscribe((posts) => {
        this.autocomplete.set(posts);
      });
  }

  exitSearch() {
    setTimeout(() => {
      this.autocomplete.set(null);
    }, 500);
  }

  search() {
    const query = _.trim(this.query());
    if (_.isEmpty(query)) {
      this.autocomplete.set(null);
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        query,
        page: 1,
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }

  loadRecords() {
    this.marketService
      .fetch_posts({
      skip: this.skip,
      limit: this.limit(),
      })
      .subscribe((records: any) => {
      this.records.set(records);
      this.skip = records.skip;
      this.limit.set(records.limit);
      this.count.set(_.get(records, 'count', 0));
      this.loader.hide();
      });
  }

  loadSearchPage() {
    this.records.set(null);
    this.marketService
      .search_posts({
      limit: this.limit(),
      skip: this.skip,
      query: this.query(),
      gear: JSON.stringify(this.gearFilters()),
      material: JSON.stringify(this.materialFilters()),
      })
      .subscribe((postsList: any) => {
      this.records.set(postsList);
      this.skip = postsList.skip;
      this.limit.set(postsList.limit);
      this.count.set(postsList.count);
      this.loader.hide();
      });
  }

  toggleFilter(type: any, subType: any) {
    if (type === 'material') {
      if (_.find(this.materialFilters(), (i) => i === subType)) {
      this.materialFilters.update((filters) =>
        filters.filter((item) => item !== subType),
      );
      } else {
      this.materialFilters.update((filters) => [...filters, subType]);
      }
    } else {
      if (_.find(this.gearFilters(), (i) => i === subType)) {
      this.gearFilters.update((filters) =>
        filters.filter((item) => item !== subType),
      );
      } else {
      this.gearFilters.update((filters) => [...filters, subType]);
      }
    }
    this.selectedFilters.update((filters) => ({
      ...filters,
      [`${type}.${subType}`]: !filters[`${type}.${subType}`],
    }));
    this.activateFilters();
  }

  activateFilters() {
    const queryParams = {
      query: _.isEmpty(this.query()) ? null : this.query(),
      material: _.isEmpty(this.materialFilters())
      ? null
      : this.materialFilters(),
      gear: _.isEmpty(this.gearFilters()) ? null : this.gearFilters(),
    };

    this.router.navigateByUrl(this.router.url.split(/[?#]/)[0]).then(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
      });
    });
  }

  changePage(event: any) {
    this.records.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + event.pageIndex,
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  private ensureArray(value: any) {
    return Array.isArray(value) ? value : [value];
  }
}
