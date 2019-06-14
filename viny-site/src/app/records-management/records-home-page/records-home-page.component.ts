import { Component, OnInit, ViewChild } from '@angular/core';
import genresJSON from '../../shared-modules/data/genres.json';
import countriesJSON from '../../shared-modules/data/countries.json';
import * as _ from 'lodash';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared-modules/auth/auth.service';
import { RecordsService } from '../../services/records.service';

declare const $: any;

@Component({
  selector: 'app-records-home-page',
  templateUrl: './records-home-page.component.html',
  styleUrls: ['./records-home-page.component.css']
})
export class RecordsHomePageComponent implements OnInit {
  public genresJSON = genresJSON;
  public objectKeys = Object.keys;
  @ViewChild('recordsloader', {static: true}) loader: LoaderComponent;
  // context control
  public records = null;
  public skip = 0;
  public limit = 30;
  public count = 0;
  public page = 1;
  public autocomplete = null;
  public _ = _;
  public query = null;
  public component = this;

  // page filters
  public genreFilters = [];
  public styleFilters = [];
  public formatFilters = [];
  public countryFilters = [];

  // context control
  public chosenTemp = [];
  public toChooseFrom = [];
  public chosenFilter = '';

  constructor(public route: ActivatedRoute,
              private router: Router,
              public auth: AuthService,
              private recordsService: RecordsService) {

  }

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

      if (_.isEmpty(_.trim(this.query)) &&
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
    let styles = [];
    _.each(this.objectKeys(genresJSON), (g) => {
      styles = _.concat(genresJSON[g], styles);
    });

    return _.uniq(styles);
  }

  getCountries() {
    return _.map(countriesJSON, (c) => c.name);
  }

  loadAutoComplete(event) {
    const query = _.trim(event.target.value);
    if (_.isEmpty(query)) {
      this.autocomplete = null;
      return;
    }
    this.autocomplete = this.recordsService.search_records({limit: 5, skip: 0, query});
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
    const data = this.recordsService.fetch_records({
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

  openFilter(toChooseFrom, ref) {
    this.chosenTemp = _.cloneDeep(this[ref]);
    this.toChooseFrom = _.cloneDeep(toChooseFrom);
    this.chosenFilter = ref;

    $('#filterModal').modal('show');
  }

  filtersChosen() {
    console.log(this.chosenFilter, this.chosenTemp, this.chosenFilter)
    this[this.chosenFilter] = this.chosenTemp;
    this.chosenTemp = [];
    this.chosenFilter = null;
  }

  activateFilters() {
    const queryParams = {
      query: _.isEmpty(this.query) ? null : this.query,
      genres: _.isEmpty(this.genreFilters) ? null : this.genreFilters,
      styles: _.isEmpty(this.styleFilters) ? null : this.styleFilters,
      formats: _.isEmpty(this.formatFilters) ? null : this.formatFilters,
      countries: _.isEmpty(this.countryFilters) ? null : this.countryFilters
    };

    this.router.navigateByUrl(this.router.url.split(/[?#]/)[0]).then(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams
      });
    });
  }
}
