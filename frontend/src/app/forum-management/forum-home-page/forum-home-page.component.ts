import { Component, OnInit, ViewChild } from '@angular/core';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { AuthService } from '../../shared-modules/services/auth.service';
import { ForumService } from '../services/forum.service';
import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-forum-home-page',
  templateUrl: './forum-home-page.component.html',
  styleUrls: ['./forum-home-page.component.css'],
})
export class ForumHomePageComponent implements OnInit {
  protected posts = null;
  protected skip = 0;
  protected limit = 10;
  protected count = 0;
  protected page = 1;
  protected autocomplete: Observable<any> = new Observable();
  protected _ = _;
  protected query: string = '';
  protected loading: boolean = false;

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
        this.loadPosts();
      } else {
        this.loadSearchPage();
      }
    });
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

  loadAutoComplete(event: any) {
    const query = _.trim(event.target.value);

    if (_.isEmpty(query)) {
      this.autocomplete = new Observable();
      return;
    }

    this.autocomplete = this.forumService.search_posts({
      limit: 5,
      skip: 0,
      query,
    });
  }

  exitSearch() {
    setTimeout(() => {
      this.autocomplete = new Observable();
    }, 500);
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
}
