import { Component, OnInit, ViewChild } from '@angular/core';
import genresJSON from '../../shared/data/genres.json';
import countriesJSON from '../../shared/data/countries.json';
import decadesJSON from '../../shared/data/decades.json';
import * as _ from 'lodash';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { RecordsService } from '../../services/records.service';

@Component({
  selector: 'app-records-home-page',
  templateUrl: './records-home-page.component.html',
  styleUrls: ['./records-home-page.component.css']
})
export class RecordsHomePageComponent implements OnInit {
  public genresJSON = genresJSON;
  public countriesJSON = countriesJSON;
  public decadesJSON = decadesJSON;
  public objectKeys = Object.keys;
  @ViewChild('recordsloader') loader: LoaderComponent;
  // context control
  public records = null;
  public skip = 0;
  public limit = 30;
  public count = 0;
  public page = 1;
  public autocomplete = null;
  public _ = _;
  public query = null;

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
      if (_.isEmpty(_.trim(this.query))) {
        this.loadRecords();
      } else {
        this.loadSearchPage();
      }
    });
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
    const data = this.recordsService.save_record({
      limit: this.limit,
      skip: this.skip,
      query: this.query
    });

    this.records = data;

    data.subscribe((postsList: any) => {
      this.skip = postsList.skip;
      this.limit = postsList.limit;
      this.count = postsList.count;
      this.loader.hide();
    });
  }

  nextPage() {
    if (this.skip + this.limit >= this.count) {
      return;
    }
    this.records = null;
    this.skip += this.limit;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + Number(this.page)
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }

  previousPage() {
    if (this.skip - this.limit < 0) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: Number(this.page) - 1
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
    this.records = null;
    this.skip = _.max([this.skip - this.limit, 0]);
  }
}
