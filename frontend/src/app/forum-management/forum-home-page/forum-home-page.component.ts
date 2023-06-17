import { Component, OnInit, ViewChild } from '@angular/core';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { AuthService } from '../../shared-modules/services/auth.service';
import { ForumService } from '../services/forum.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-forum-home-page',
  templateUrl: './forum-home-page.component.html',
  styleUrls: ['./forum-home-page.component.css']
})
export class ForumHomePageComponent implements OnInit {
  public posts = null;
  public skip = 0;
  public limit = 10;
  public count = 0;
  public page = 1;
  public autocomplete: Observable<any> = new Observable();
  public _ = _;
  public query: string = '';

  @ViewChild('forumloader', { static: true }) loader!: LoaderComponent;

  constructor(public forumService: ForumService,
    public route: ActivatedRoute,
    public router: Router,
    public auth: AuthService) {

  }

  ngOnInit() {
    this.route.queryParams.subscribe((p: any) => {
      this.posts = null;
      const page = _.max([_.get(p, 'page', 1), 1]);
      this.skip = (page - 1) * this.limit;
      this.page = page;
      this.loader.show();
      this.query = _.get(p, 'query', '');
      if (_.isEmpty(_.trim(this.query))) {
        this.loadPosts();
      } else {
        this.loadSearchPage();
      }
    });

  }

  loadPosts() {
    const data = this.forumService.fetch_posts({
      limit: this.limit,
      skip: this.skip
    });

    data.subscribe((postsList: any) => {
      this.posts = postsList.posts;
      this.skip = postsList.skip;
      this.limit = postsList.limit;
      this.count = _.get(postsList, 'count', 0);
      this.loader.hide();
    });
  }

  loadSearchPage() {
    const data = this.forumService.search_posts({
      limit: this.limit,
      skip: this.skip,
      query: this.query
    });

    data.subscribe((postsList: any) => {
      this.posts = postsList.posts;
      this.skip = postsList.skip;
      this.limit = postsList.limit;
      this.count = postsList.count;
      this.loader.hide();
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
      query
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
        page: 1 + event.pageIndex
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
        page: 1
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
  }
}
