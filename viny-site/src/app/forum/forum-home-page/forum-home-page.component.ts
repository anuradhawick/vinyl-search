import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { AuthService } from '../../auth/auth.service';

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
  public autocomplete = null;
  public _ = _;
  public query = null;

  @ViewChild('forumloader') loader: LoaderComponent;

  constructor(private fns: AngularFireFunctions,
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
    const callable = this.fns.httpsCallable('retrieve_posts');
    const data = callable({limit: this.limit, skip: this.skip});

    data.subscribe((postsList) => {
      this.posts = postsList.posts;
      this.skip = postsList.skip;
      this.limit = postsList.limit;
      this.count = _.get(postsList, 'count', 0);
      this.loader.hide();
    });
  }

  loadSearchPage() {
    this.posts = null;
    const callable = this.fns.httpsCallable('search_posts');
    const data = callable({limit: this.limit, skip: this.skip, query: this.query});

    data.subscribe((postsList) => {
      this.posts = postsList.posts;
      this.skip = postsList.skip;
      this.limit = postsList.limit;
      this.count = postsList.count;
      this.loader.hide();
    });
  }

  loadAutoComplete(event) {
    const query = _.trim(event.target.value);
    const callable = this.fns.httpsCallable('search_posts');
    if (_.isEmpty(query)) {
      this.autocomplete = null;
      return;
    }
    this.autocomplete = callable({limit: 5, skip: 0, query});
  }

  exitSearch() {
    setTimeout(() => {
      this.autocomplete = null;
    }, 500);
  }

  nextPage() {
    if (this.skip + this.limit >= this.count) {
      return;
    }
    this.posts = null;
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
    this.posts = null;
    this.skip = _.max([this.skip - this.limit, 0]);
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
}
