import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as _ from 'lodash';
import { AuthService } from '../../shared/services/auth.service';
import { ForumService } from '../services/forum.service';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
} from 'rxjs';
import { MatFormField, MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import {
  MatList,
  MatListItem,
  MatListItemAvatar,
  MatListItemTitle,
  MatListItemLine,
} from '@angular/material/list';
import { MatPaginator } from '@angular/material/paginator';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-forum-home-page',
  templateUrl: './forum-home-page.component.html',
  styleUrls: ['./forum-home-page.component.scss'],
  imports: [
    MatFormField,
    MatInput,
    FormsModule,
    MatButton,
    RouterLink,
    MatCard,
    MatCardContent,
    LoaderComponent,
    MatList,
    MatListItem,
    MatListItemAvatar,
    MatListItemTitle,
    MatListItemLine,
    MatPaginator,
    AsyncPipe,
    DatePipe,
  ],
})
export class ForumHomePageComponent implements OnInit {
  protected posts = signal<any>(null);
  protected skip = 0;
  protected limit = signal(10);
  protected count = signal(0);
  protected page = signal(1);
  protected autocompleteShow = signal(false);
  protected autocompleteResult = signal<any>(null);
  protected autocompleteEvent: Subject<string> = new Subject();
  protected query = signal('');
  protected loading = signal(false);
  protected _ = _;

  constructor(
    protected forumService: ForumService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected auth: AuthService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.posts.set(null);
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit();
      this.page.set(page);
      this.query.set(_.get(p, 'query', ''));
      if (_.isEmpty(_.trim(this.query()))) {
        this.autocompleteResult.set(null);
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
          this.autocompleteShow.set(true);
          this.autocompleteResult.set(result);
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

  loadPosts() {
    this.loading.set(true);
    this.forumService
      .fetch_posts({
        limit: this.limit(),
        skip: this.skip,
      })
      .pipe(catchError(() => of(null)))
      .subscribe((postsList: any) => {
        if (postsList) {
          this.posts.set(postsList.posts);
          this.skip = postsList.skip;
          this.limit.set(postsList.limit);
          this.count.set(_.get(postsList, 'count', 0));
        } else {
          alert('Unable to load');
        }
        this.loading.set(false);
      });
  }

  loadSearchPage() {
    this.loading.set(true);
    this.forumService
      .search_posts({
        limit: this.limit(),
        skip: this.skip,
        query: this.query(),
      })
      .subscribe((postsList: any) => {
        this.posts.set(postsList.posts);
        this.skip = postsList.skip;
        this.limit.set(postsList.limit);
        this.count.set(postsList.count);
        this.loading.set(false);
      });
  }

  changePage(event: any) {
    this.posts.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1 + event.pageIndex,
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
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
}
