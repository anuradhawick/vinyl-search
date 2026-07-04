import {
  Component,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import * as _ from 'lodash';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { RecordsService } from '../services/records.service';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { ChooseFilterComponent } from '../modals/choose-filter/choose-filter.component';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
} from 'rxjs';
// @ts-ignore
import genresJSON from '../../shared/data/genres.json';
// @ts-ignore
import countriesJSON from '../../shared/data/countries.json';
import { MatFormField, MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatPaginator } from '@angular/material/paginator';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-records-home-page',
  templateUrl: './records-home-page.component.html',
  styleUrls: ['./records-home-page.component.scss'],
  imports: [
    MatFormField,
    MatInput,
    FormsModule,
    MatButton,
    RouterLink,
    MatCard,
    MatCardContent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    LoaderComponent,
    MatPaginator,
    AsyncPipe,
  ],
})
export class RecordsHomePageComponent implements OnInit {
  public genresJSON = genresJSON;
  public objectKeys = Object.keys;
  @ViewChild('recordsloader', { static: true })
  loader!: LoaderComponent;
  // context control
  public records = signal<any>(null);
  public skip = 0;
  public limit = signal(30);
  public count = signal(0);
  public page = signal(1);
  protected autocompleteShow = signal(false);
  protected autocompleteResult = signal<any>(null);
  protected autocompleteEvent: Subject<string> = new Subject();
  public _ = _;
  public query = signal('');
  public component: any = this;

  // page filters
  public genreFilters = signal<any[]>([]);
  public styleFilters = signal<any[]>([]);
  public formatFilters = signal<any[]>([]);
  public countryFilters = signal<any[]>([]);
  private readonly filterSignals: Record<string, WritableSignal<any[]>> = {
    genreFilters: this.genreFilters,
    styleFilters: this.styleFilters,
    formatFilters: this.formatFilters,
    countryFilters: this.countryFilters,
  };

  public environment = environment;
  @ViewChild(MatAccordion, { static: false })
  filtersPanel!: MatAccordion;

  constructor(
    protected route: ActivatedRoute,
    protected auth: AuthService,
    private router: Router,
    private recordsService: RecordsService,
    private filterDialog: MatDialog,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.records.set(null);
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit();
      this.page.set(page);
      this.loader.show();
      this.query.set(_.get(p, 'query', ''));
      this.genreFilters.set(this.ensureArray(_.get(p, 'genres', [])));
      this.styleFilters.set(this.ensureArray(_.get(p, 'styles', [])));
      this.formatFilters.set(this.ensureArray(_.get(p, 'formats', [])));
      this.countryFilters.set(this.ensureArray(_.get(p, 'countries', [])));

      if (
        _.isEmpty(_.trim(this.query())) &&
        _.isEmpty(this.genreFilters()) &&
        _.isEmpty(this.styleFilters()) &&
        _.isEmpty(this.countryFilters()) &&
        _.isEmpty(this.formatFilters())
      ) {
        this.autocompleteResult.set(null);
        this.loadRecords();
      } else {
        this.loadSearchPage();
      }
    });

    this.autocompleteEvent
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((query: string) => {
          return !!query
            ? this.recordsService.search_records({
                limit: 5,
                skip: 0,
                query,
              })
            : of(null);
        }),
      )
      .subscribe((result: any) => {
        if (result) {
          this.autocompleteShow.set(true);
          this.autocompleteResult.set(result.records);
        } else {
          this.autocompleteShow.set(false);
          this.autocompleteResult.set(null);
        }
      });
  }

  exitSearch() {
    setTimeout(() => {
      this.autocompleteShow.set(false);
    }, 300);
  }

  exitSearchRoute() {
    this.autocompleteEvent.next('');
    this.router.navigate(['/records']);
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

  search() {
    const query = _.trim(this.query());
    if (_.isEmpty(query)) {
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
    this.recordsService
      .fetch_records({
        skip: this.skip,
        limit: this.limit(),
      })
      .subscribe((res: any) => {
        this.loader.hide();
        this.records.set(res.records);
        this.skip = res.skip;
        this.limit.set(res.limit);
        this.count.set(_.get(res, 'count', 0));
      });
  }

  loadSearchPage() {
    this.records.set(null);
    this.recordsService
      .search_records({
        limit: this.limit(),
        skip: this.skip,
        query: this.query(),
        genres: JSON.stringify(this.genreFilters()),
        styles: JSON.stringify(this.styleFilters()),
        formats: JSON.stringify(this.formatFilters()),
        countries: JSON.stringify(this.countryFilters()),
      })
      .subscribe((res: any) => {
        this.records.set(res.records);
        this.skip = res.skip;
        this.limit.set(res.limit);
        this.count.set(res.count);
        this.loader.hide();
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

  openFilter(toChooseFrom: any, ref: any) {
    const filterSignal = this.getFilterSignal(ref);
    const active = _.cloneDeep(filterSignal());
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
        filterSignal.set(filters);
        this.activateFilters();
      }
    });
  }

  activateFilters() {
    this.filtersPanel.closeAll();

    const queryParams = {
      query: _.isEmpty(this.query()) ? null : this.query(),
      genres: _.isEmpty(this.genreFilters()) ? null : this.genreFilters(),
      styles: _.isEmpty(this.styleFilters()) ? null : this.styleFilters(),
      formats: _.isEmpty(this.formatFilters()) ? null : this.formatFilters(),
      countries: _.isEmpty(this.countryFilters())
        ? null
        : this.countryFilters(),
    };

    this.router.navigateByUrl(this.router.url.split(/[?#]/)[0]).then(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
      });
    });
  }

  private ensureArray(value: any) {
    return Array.isArray(value) ? value : [value];
  }

  private getFilterSignal(ref: string) {
    return this.filterSignals[ref];
  }
}
