import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { AuthService } from '../../shared-modules/services/auth.service';
import { ForumService } from '../services/forum.service';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-forum-home-page',
  templateUrl: './forum-home-page.component.html',
  styleUrls: ['./forum-home-page.component.scss'],
})
export class ForumHomePageComponent implements OnInit {
  protected posts: any = null;
  protected skip = 0;
  protected limit = 10;
  protected count = 0;
  protected page = 1;
  protected autocompleteShow = false;
  protected autocompleteResult: any = null;
  protected autocompleteEvent: Subject<string> = new Subject();
  protected query: string = '';
  protected loading: boolean = false;
  protected _ = _;

  constructor(
    protected forumService: ForumService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected auth: AuthService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.posts = null;
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit;
      this.page = page;
      this.query = _.get(p, 'query', '');
      if (_.isEmpty(_.trim(this.query))) {
        this.autocompleteResult = null;
        this.loadPosts();
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
            ? this.forumService.search_posts({
                limit: 5,
                skip: 0,
                query,
              })
            : of(null);
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.autocompleteShow = true;
          this.autocompleteResult = result;
        } else {
          this.autocompleteShow = false;
          this.autocompleteResult = null;
        }
      });
  }

  exitSearch() {
    setTimeout(() => {
      this.autocompleteShow = false;
    }, 300);
  }

  loadPosts() {
    this.loading = true;
    this.forumService
      .fetch_posts({
        limit: this.limit,
        skip: this.skip,
      })
      .pipe(catchError(() => of(null)))
      .subscribe((postsList: any) => {
        if (postsList) {
          this.posts = postsList.posts;
          this.skip = postsList.skip;
          this.limit = postsList.limit;
          this.count = _.get(postsList, 'count', 0);
        } else {
          alert('Unable to load');
        }
        this.loading = false;
      });
  }

  loadSearchPage() {
    this.loading = true;
    this.forumService
      .search_posts({
        limit: this.limit,
        skip: this.skip,
        query: this.query,
      })
      .subscribe((postsList: any) => {
        this.posts = postsList.posts;
        this.skip = postsList.skip;
        this.limit = postsList.limit;
        this.count = postsList.count;
        this.loading = false;
      });
  }

  changePage(event: any) {
    this.posts = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + event.pageIndex,
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }

  search() {
    const query = _.trim(this.query);
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
}
