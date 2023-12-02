import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared-modules/services/auth.service';
import { RecordsService } from '../services/records.service';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ChooseFilterComponent } from '../modals/choose-filter/choose-filter.component';
import { Observable } from 'rxjs';
// @ts-ignore
import genresJSON from '../../shared-modules/data/genres.json';
// @ts-ignore
import countriesJSON from '../../shared-modules/data/countries.json';

declare const $: any;

@Component({
  selector: 'app-records-home-page',
  templateUrl: './records-home-page.component.html',
  styleUrls: ['./records-home-page.component.css'],
})
export class RecordsHomePageComponent implements OnInit {
  public genresJSON = genresJSON;
  public objectKeys = Object.keys;
  @ViewChild('recordsloader', { static: true })
  loader!: LoaderComponent;
  // context control
  public records: any = null;
  public skip = 0;
  public limit = 30;
  public count = 0;
  public page = 1;
  public autocomplete: Observable<any> = new Observable();
  public _ = _;
  public query: any = null;
  public component: any = this;

  // page filters
  public genreFilters = [];
  public styleFilters = [];
  public formatFilters = [];
  public countryFilters = [];

  public environment = environment;
  @ViewChild(MatAccordion, { static: false })
  filtersPanel!: MatAccordion;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
    private recordsService: RecordsService,
    private filterDialog: MatDialog,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.records = null;
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit;
      this.page = page;
      this.loader.show();
      this.query = _.get(p, 'query', '');
      this.genreFilters = _.get(p, 'genres', []);
      this.styleFilters = _.get(p, 'styles', []);
      this.formatFilters = _.get(p, 'formats', []);
      this.countryFilters = _.get(p, 'countries', []);

      if (!Array.isArray(this.genreFilters)) {
        this.genreFilters = [this.genreFilters];
      }
      if (!Array.isArray(this.styleFilters)) {
        this.styleFilters = [this.styleFilters];
      }
      if (!Array.isArray(this.formatFilters)) {
        this.formatFilters = [this.formatFilters];
      }
      if (!Array.isArray(this.countryFilters)) {
        this.countryFilters = [this.countryFilters];
      }

      if (
        _.isEmpty(_.trim(this.query)) &&
        _.isEmpty(this.genreFilters) &&
        _.isEmpty(this.styleFilters) &&
        _.isEmpty(this.countryFilters) &&
        _.isEmpty(this.formatFilters)
      ) {
        this.loadRecords();
      } else {
        this.loadSearchPage();
      }
    });
  }

  getStyles() {
    let styles: any = [];
    _.each(this.objectKeys(genresJSON), (g: string) => {
      styles = _.concat(_.get(genresJSON, g, []), styles);
    });

    return _.uniq(styles);
  }

  getCountries() {
    return _.map(countriesJSON, (c) => c.name);
  }

  loadAutoComplete(event: any) {
    const query: string = _.trim(event.target.value);
    let newquery = '';

    if (_.isEmpty(query) || query.length < 3) {
      this.autocomplete = new Observable();
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

    this.autocomplete = this.recordsService.search_records({
      limit: 5,
      skip: 0,
      query: _.trim(newquery),
    });
  }

  exitSearch() {
    setTimeout(() => {
      this.autocomplete = new Observable();
    }, 500);
  }

  search() {
    const query = _.trim(this.query);
    if (_.isEmpty(query)) {
      this.autocomplete = new Observable();
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
    const data = this.recordsService.fetch_records({
      skip: this.skip,
      limit: this.limit,
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
    const data = this.recordsService.search_records({
      limit: this.limit,
      skip: this.skip,
      query: this.query,
      genres: JSON.stringify(this.genreFilters),
      styles: JSON.stringify(this.styleFilters),
      formats: JSON.stringify(this.formatFilters),
      countries: JSON.stringify(this.countryFilters),
    });

    this.records = data;

    data.subscribe((postsList: any) => {
      this.skip = postsList.skip;
      this.limit = postsList.limit;
      this.count = postsList.count;
      this.loader.hide();
    });
  }

  changePage(event: any) {
    this.records = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + event.pageIndex,
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }

  openFilter(toChooseFrom: any, ref: any) {
    const active = _.cloneDeep(_.get(this, ref));
    const all = _.cloneDeep(toChooseFrom);
    let filterCriteria = '';

    switch (ref) {
      case 'genreFilters':
        filterCriteria = 'genres';
        break;
      case 'styleFilters':
        filterCriteria = 'styles';
        break;
      case 'countryFilters':
        filterCriteria = 'countries';
        break;
      case 'formatFilters':
        filterCriteria = 'formats';
        break;
    }

    const dialogRef = this.filterDialog.open(ChooseFilterComponent, {
      data: {
        title: `Select the ${filterCriteria}`,
        all,
        selected: active,
      },
    });

    dialogRef.afterClosed().subscribe(({ filters, selected }) => {
      if (selected) {
        _.set(this, ref, filters);
        this.activateFilters();
      }
    });
  }

  activateFilters() {
    this.filtersPanel.closeAll();

    const queryParams = {
      query: _.isEmpty(this.query) ? null : this.query,
      genres: _.isEmpty(this.genreFilters) ? null : this.genreFilters,
      styles: _.isEmpty(this.styleFilters) ? null : this.styleFilters,
      formats: _.isEmpty(this.formatFilters) ? null : this.formatFilters,
      countries: _.isEmpty(this.countryFilters) ? null : this.countryFilters,
    };

    this.router.navigateByUrl(this.router.url.split(/[?#]/)[0]).then(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
      });
    });
  }
}
