import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from '../../shared/loader/loader.component';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import * as _ from 'lodash';
import { AuthService } from '../../auth/auth.service';
import { ForumService } from '../../services/forum.service';


@Component({
  selector: 'app-forum-view-page',
  templateUrl: './forum-view-page.component.html',
  styleUrls: ['./forum-view-page.component.css']
})
export class ForumViewPageComponent implements OnInit {
  public post;
  @ViewChild('postloader') loader: LoaderComponent;
  public Editor = ClassicEditor;
  public title = '';
  public data = '';

  constructor(public route: ActivatedRoute,
              private forumService: ForumService,
              public auth: AuthService,
              private router: Router) {
  }

  ngOnInit() {
    this.loader.show();

    this.route.paramMap.subscribe((map: any) => {
      const postId = _.get(map, 'params.postId', null);
      if (_.isEmpty(postId)) {
        return;
      }

      const data = this.forumService.fetch_post(postId);

      data.subscribe((res: any) => {
        const post = res.post;
        this.post = post;
        this.data = _.get(post, 'postHTML', '');
        this.title = _.get(post, 'postTitle', '');
        this.loader.hide();
      });
    });
  }

  delete() {
    this.loader.show();
    const data = this.forumService.delete_post(this.post.id);
    data.subscribe(() => {
    this.loader.hide();
      this.router.navigate(['/forum']);
    });
  }
}
