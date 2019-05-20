import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireFunctions } from '@angular/fire/functions';
import { LoaderComponent } from '../../shared/loader/loader.component';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-inline';
import * as _ from 'lodash';


@Component({
  selector: 'app-forum-view-page',
  templateUrl: './forum-view-page.component.html',
  styleUrls: ['./forum-view-page.component.css']
})
export class ForumViewPageComponent implements OnInit {
  private post;
  @ViewChild('postloader') loader: LoaderComponent;
  private Editor = ClassicEditor;
  private title = '';
  private data = '';
  private hideView = true;

  constructor(private route: ActivatedRoute, private fns: AngularFireFunctions) {
  }

  ngOnInit() {
    this.loader.show();

    this.route.paramMap.subscribe((map: any) => {
      const postId = _.get(map, 'params.postId', null);
      if (_.isEmpty(postId)) {
        return;
      }
      const callable = this.fns.httpsCallable('retrieve_post');
      const data = callable({postId: postId});
      data.subscribe((post) => {
        this.post = post;
        this.data = _.get(post, 'postHTML', '');
        this.title = _.get(post, 'postTitle', '');
        this.loader.hide();
        this.hideView = false;
      });
    });
  }
}
